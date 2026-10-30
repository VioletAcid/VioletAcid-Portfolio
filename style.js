
document.addEventListener("DOMContentLoaded", () => {
    const enterButton = document.getElementById("enterFacility");

    if (enterButton) {
        enterButton.addEventListener("click", () => {
            window.location.href = "about.html";
        });
    }
});
