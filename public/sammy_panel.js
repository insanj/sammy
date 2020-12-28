let modalShowing = false;

function toggleModal(shouldShow) {
    const sammyPanel = document.getElementById("sammy-panel");

    if (sammyPanel.style.opacity && sammyPanel.style.opacity < 1.0) {
        return;
    }

    if (shouldShow) {
        const controlsDiv = document.getElementsByClassName("panel-controls")[0];
        controlsDiv.style.display = 'none';

        const toolbarDiv = document.getElementsByClassName("panel-toolbar")[0];
        toolbarDiv.style.display = 'none';

        const printDiv = document.getElementsByClassName("panel-print")[0];
        printDiv.style.display = 'block';

        sammyPanel.style.width = 'calc(100% - 40px)';
        sammyPanel.style.height = 'auto';
        sammyPanel.className += "printing";
    }

    else {
        const controlsDiv = document.getElementsByClassName("panel-controls")[0];
        controlsDiv.style.display = 'block';

        const toolbarDiv = document.getElementsByClassName("panel-toolbar")[0];
        toolbarDiv.style.display = 'block';

        const printDiv = document.getElementsByClassName("panel-print")[0];
        printDiv.style.display = 'none';

        sammyPanel.style.width = '192px';
        sammyPanel.style.height = '246px';
        sammyPanel.className = sammyPanel.className.replace("printing", "");
    }

    modalShowing = shouldShow;
}

const shareButton = document.getElementsByClassName("panel-button share")[0];
const printButton = document.getElementsByClassName("panel-button print")[0];

const leaveButton = document.getElementsByClassName("leave-button")[0];

shareButton.addEventListener("click", () => {
    toggleModal(true);
});

printButton.addEventListener("click", () => {
    toggleModal(true);
});

leaveButton.addEventListener("click", () => {
    toggleModal(false);
});