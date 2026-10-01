class Alerts
{
    containerElement = undefined;

    constructor(containerId) {
        this.containerElement = document.getElementById(containerId);

        if (!this.containerElement) {
            throw new Error(`Alert container element with Id "${containerId}" not found.`);
        }
    }

    addAlert(message, type)
    {
        if (this.containerElement) {
            const alertElement = document.createElement('article');
            alertElement.className = this._getTypeClassName(type);
            alertElement.innerHTML = `<span>${message}</span>`;
            this.containerElement.appendChild(alertElement);

            setTimeout(() => {
                this.containerElement.removeChild(alertElement);
            }, 2000);
        }
        else {
            console.error(`Cannot add alert: container element not found.`);
        }
    }

    _getTypeClassName(type)
    {
        let className = "";

        switch (type) {
            case "success":
                className = "green";
                break;
            case "error":
                className = "red";
                break;
            case "warning":
                className = "yellow";
                break;
            case "info":
                className = "slate";
                break;
            default:
                className = "pink";
                console.log(`Unknown alert type: "${type}". Using default "pink".`);
                break;
        }


        return `pico-background-${className}-500`;
    }


}