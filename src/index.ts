export type ModalPopupConfig = {
    /**
     * The base URL for the modal. Use placeholders like `:store_name` and `:product_slug`
     * for dynamic path segments.
     * Example: "https://example.com/:store_name/:product_slug/"
     */
    url?: string;
    onClose?: () => void;
    onOpen?: () => void;
};

/**
 * Represents a modal popup that can be opened and closed within a browser environment.
 * 
 * The `ModalPopup` class allows for the creation and management of a modal window
 * that displays content from a specified URL. It supports dynamic URL construction
 * using path and query parameters, and provides hooks for custom actions on open
 * and close events.
 * 
 * @property {string | null} modalUrl - The base URL for the modal content.
 * @property {() => void} onClose - Callback function executed when the modal is closed.
 * @property {() => void} onOpen - Callback function executed when the modal is opened.
 * @property {HTMLElement | null} modalElement - The DOM element representing the modal.
 * 
 * @constructor
 * @param {ModalPopupConfig} cfg - Configuration object for initializing the modal popup.
 * 
 * @method openPopup - Opens the modal with specified path and query parameters.
 * @method closePopup - Closes the currently open modal.
 * 
 * @throws Will throw an error if the URL is not provided or if used outside a browser environment.
 */
export class ModalPopup {
    private modalUrl: string | null;
    private onClose: () => void;
    private onOpen: () => void;
    private modalElementMap: WeakMap<ModalPopup, HTMLElement>;

    constructor(cfg: ModalPopupConfig) {
        this.modalUrl = cfg.url || null;
        this.onClose = cfg.onClose || (() => { });
        this.onOpen = cfg.onOpen || (() => { });
        this.modalElementMap = new WeakMap();

        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
            // Cleanup modal before page reload
            function debounce<T extends (...args: any[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
                let timeout: ReturnType<typeof setTimeout>;
                return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
                    clearTimeout(timeout);
                    timeout = setTimeout(() => func.apply(this, args), wait);
                };
            }

            window.addEventListener(
                'beforeunload',
                debounce(() => {
                    // Ensure 'this' context is correct
                    (window as any).closePopup?.();
                }, 300),
                { once: true }
            );
        }
    }

    /**
     * Constructs a URL by replacing path parameters and appending query parameters.
     *
     * @param pathParams - An object containing key-value pairs to replace path placeholders in the URL.
     * @param queryParams - An object containing key-value pairs to be appended as query parameters.
     * @returns The constructed URL with path and query parameters.
     * @throws Error if the base URL is not set.
     */
    private buildUrl(pathParams: Record<string, string>, queryParams: Record<string, string>): string {
        if (!this.modalUrl) {
            throw new Error('URL is required.');
        }

        // Replace path placeholders with actual values
        let url = this.modalUrl;
        for (const [key, value] of Object.entries(pathParams)) {
            url = url.replace(`:${key}`, value);
        }

        // Append query parameters
        const params = new URLSearchParams(queryParams);
        return `${url}?${params.toString()}`;
    }

    /**
     * Opens a modal popup by constructing a URL with the given path and query parameters.
     * If a modal is already open, it logs a warning and exits.
     * Throws an error if executed outside a browser environment.
     *
     * @param pathParams - An object containing key-value pairs to replace path placeholders in the URL.
     * @param queryParams - An object containing key-value pairs to be appended as query parameters.
     * @throws Error if not in a browser environment.
     */
    public openPopup(pathParams: Record<string, string> = {}, queryParams: Record<string, string> = {}): void {
        try {
            if (typeof window === 'undefined' || typeof document === 'undefined') {
                throw new Error('ModalPopup can only be used in a browser environment.');
            }

            if (this.modalElementMap.has(this)) {
                console.warn('A modal is already open.');
                return;
            }

            const url = this.buildUrl(pathParams, queryParams);
            const modalElement = this.createModalElement(url);
            this.modalElementMap.set(this, modalElement);
            document.body.appendChild(modalElement);
            this.onOpen();
        } catch (error) {
            console.error('Failed to open popup:', error);
        }
    }

    /**
     * Closes the currently open modal popup by removing it from the DOM.
     * Sets the modal element to null and triggers the onClose callback.
     */
    public closePopup(): void {
        const modalElement = this.modalElementMap.get(this);
        if (modalElement) {
            document.body.removeChild(modalElement);
            this.modalElementMap.delete(this);
        } else {
            console.warn('No modal found for this instance.');
        }
        this.onClose();
    }

    /**
     * Creates and returns a modal element containing an iframe with the specified URL.
     * The modal includes a close button and is styled to cover the entire viewport.
     * Clicking outside the modal content or on the close button will close the modal.
     *
     * @param url - The URL to be loaded in the iframe within the modal.
     * @returns The constructed modal container element.
     */
    private createModalElement(url: string): HTMLElement {
        // Create the modal container and apply styles directly to it
        const modalContainer = document.createElement('div');
        modalContainer.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        background-color: rgba(0, 0, 0, 0.5) !important;
        backdrop-filter: blur(10px) !important;
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
        z-index: 1000 !important;
    `;

        // Create the modal content (directly inside the modal container)
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
        background-color: white !important;
        padding: 20px !important;
        border-radius: 8px !important;
        width: 80% !important;
        max-width: 80% !important;
        position: relative !important;
    `;

        // Create the close button
        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.style.cssText = `
        position: absolute !important;
        top: 10px !important;
        right: 10px !important;
        background: none !important;
        border: none !important;
        font-size: 20px !important;
        cursor: pointer !important;
    `;
        closeButton.setAttribute('aria-label', 'Close');

        // Create the iframe
        const iframe = document.createElement('iframe');
        iframe.src = url;
        // iframe.sandbox = ''; // Add sandbox attribute for security
        iframe.style.cssText = `
        width: 100% !important;
        height: 80vh !important;
        border: none !important;
        border-radius: 4px !important;
    `;
        iframe.addEventListener('error', () => {
            console.error('Failed to load iframe content from URL:', url);
            // TODO: make it show an error interactively ?
        });

        // Append elements to the modal content
        modalContent.appendChild(closeButton);
        modalContent.appendChild(iframe);

        // Append the modal content to the modal container
        modalContainer.appendChild(modalContent);

        // Attach event listeners for closing the modal
        modalContainer.addEventListener('click', (event) => {
            if (event.target === modalContainer) {
                this.closePopup();
            }
        });
        closeButton.addEventListener('click', () => this.closePopup());

        return modalContainer;
    }
}

/**
 * Creates and returns a new instance of a ModalPopup using the provided configuration.
 *
 * @param config - The configuration object for the modal popup.
 * @returns A new ModalPopup instance.
 */
export function createModalPopup(config: ModalPopupConfig): ModalPopup {
    return new ModalPopup(config);
}