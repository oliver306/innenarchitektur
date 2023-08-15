var openGalleryLink = document.getElementById('openGalleryLink');
if (openGalleryLink) {
    // Add event listener only if the element is found
    openGalleryLink.addEventListener('click', function (event) {
        // Your event handler code here
        // This code will be executed when the element with ID 'openGalleryLink' is clicked
        event.preventDefault(); // Prevent the default link behavior

        // Get the nanogallery2 instance and open the gallery view
        var nanoGallery = $("#project-gallery").nanogallery2();
        nanoGallery.nanogallery2('displayItem', '1/1'); // Display the first item (change index as needed)
    });
}