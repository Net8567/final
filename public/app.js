// File: public/js/app.js
document.addEventListener("DOMContentLoaded", () => {
    const apiUrl = "/api/cars";
    const isAdmin = true; // Toggle this for admin view

    const carouselContainer = document.getElementById("carousel-container");
    const listingContainer = document.getElementById("listing-container");
    const createBtn = document.getElementById("create-btn");
    const popupModal = document.getElementById("popup-modal");
    const carForm = document.getElementById("car-form");
    const closeModalBtn = document.getElementById("close-modal");

    let cars = [];
    let currentIndex = 0;

    // Fetch cars from the backend
    const fetchCars = async () => {
        try {
            const response = await fetch(apiUrl);
            cars = await response.json();
            renderCarousel();
            renderListings();
        } catch (error) {
            console.error("Error fetching cars:", error);
        }
    };

    // Render carousel
    const renderCarousel = () => {
        carouselContainer.innerHTML = "";
        cars.forEach((car, index) => {
            const div = document.createElement("div");
            div.className = "carousel-item";
            div.style.transform = `translateX(${100 * (index - currentIndex)}%)`;
            div.innerHTML = `
                <img src="${car.photo}" alt="Car">
                <p>Price: $${car.price}</p>
                <p>Mileage: ${car.mileage} km</p>
            `;
            carouselContainer.appendChild(div);
        });
    };

    // Render listings
    const renderListings = () => {
        listingContainer.innerHTML = "";
        cars.forEach((car) => {
            const li = document.createElement("li");
            li.className = "car-listing";
            li.innerHTML = `
                <div>
                    <img src="${car.photo}" alt="Car">
                    <p>Price: $${car.price}</p>
                    <p>Mileage: ${car.mileage} km</p>
                </div>
                ${
                isAdmin
                    ? `<button onclick="editCar('${car._id}')">Edit</button>
                           <button onclick="deleteCar('${car._id}')">Delete</button>`
                    : ""
            }
            `;
            listingContainer.appendChild(li);
        });
    };

    // Open/close modal for creating a new car
    createBtn.addEventListener("click", () => (popupModal.style.display = "flex"));
    closeModalBtn.addEventListener("click", () => (popupModal.style.display = "none"));

    // Form submission handler for creating/editing cars
    carForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const formData = new FormData(carForm);
        const carData = Object.fromEntries(formData.entries());

        try {
            if (carForm.dataset.mode === "create") {
                await fetch(apiUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(carData),
                });
            } else if (carForm.dataset.mode === "edit") {
                const carId = carForm.dataset.carId;
                await fetch(`${apiUrl}/${carId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(carData),
                });
            }

            popupModal.style.display = "none";
            carForm.reset();
            fetchCars();
        } catch (error) {
            console.error("Error saving car:", error);
        }
    });

    // Delete a car
    window.deleteCar = async (carId) => {
        if (!confirm("Are you sure you want to delete this car?")) return;
        try {
            await fetch(`${apiUrl}/${carId}`, { method: "DELETE" });
            fetchCars();
        } catch (error) {
            console.error("Error deleting car:", error);
        }
    };

    // Edit a car
    window.editCar = (carId) => {
        const car = cars.find((c) => c._id === carId);
        if (!car) return;

        carForm.dataset.mode = "edit";
        carForm.dataset.carId = carId;

        // Populate form with car data
        carForm.photo.value = car.photo;
        carForm.mileage.value = car.mileage;
        carForm.price.value = car.price;

        popupModal.style.display = "flex";
    };

    // Initialize the app
    fetchCars();
});