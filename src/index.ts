export type ModalPopupConfig = {
    /**
     * The base URL for the modal. Use placeholders like `:store_name` and `:product_slug`
     * for dynamic path segments.
     * Example: "https://example.com/:store_name/:product_slug/"
     */
    url?: string;
    onClose?: () => void;
    onOpen?: () => void;
    styles?: {
        container?: Record<string, string>;
        content?: Record<string, string>;
        iframe?: Record<string, string>;
    };
};

const DEFAULT_STYLES = {
    container: {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: '1000',
    },
    content: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        width: '80%',
        maxWidth: '80%',
        position: 'relative',
    },
    iframe: {
        width: '100%',
        height: '80vh',
        border: 'none',
        borderRadius: '4px',
    },
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
    private cfg: ModalPopupConfig;

    constructor(cfg: ModalPopupConfig) {
        this.modalUrl = cfg.url || null;
        this.onClose = cfg.onClose || (() => { });
        this.onOpen = cfg.onOpen || (() => { });
        this.modalElementMap = new WeakMap();
        this.cfg = cfg;

        function debounce<T extends (...args: any[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
            let timeout: ReturnType<typeof setTimeout>;
            return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), wait);
            };
        }

        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
            // Cleanup modal before page reload
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

        const validateParams = (params: Record<string, string>) => {
            for (const value of Object.values(params)) {
                if (/[^a-zA-Z0-9-_]/.test(value)) {
                    throw new Error('Invalid characters in URL parameters.');
                }
            }
        };

        validateParams(pathParams);
        validateParams(queryParams);

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
     * Represents a modal popup that can be opened and closed within a browser environment.
     * The modal is configured using a `ModalPopupConfig` object, which specifies the URL,
     * callbacks for open and close events, and optional styles. The modal content is loaded
     * in an iframe, and the modal can be closed by clicking outside the content or on a close button.
     * 
     * The class ensures that only one modal is open at a time and provides methods to build
     * URLs with path and query parameters. It also handles cleanup before page reload.
     */
    private applyStyles(element: HTMLElement, styles: Record<string, string>): void {
        for (const [key, value] of Object.entries(styles)) {
            element.style[key as any] = value;
        }
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
        // Merge user styles with default styles
        const containerStyles = Object.assign({}, DEFAULT_STYLES.container, this.cfg.styles?.container);
        const contentStyles = Object.assign({}, DEFAULT_STYLES.content, this.cfg.styles?.content);
        const iframeStyles = Object.assign({}, DEFAULT_STYLES.iframe, this.cfg.styles?.iframe);

        // Create the modal container and apply styles
        const modalContainer = document.createElement('div');
        this.applyStyles(modalContainer, containerStyles);

        // Create the modal content and apply styles
        const modalContent = document.createElement('div');
        this.applyStyles(modalContent, contentStyles);

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

        // Create the iframe and apply styles
        const iframe = document.createElement('iframe');
        iframe.src = url;
        // Flag	                                    Description
        // allow-scripts	                        Allows the iframe to run JavaScript.
        // allow-same-origin	                    Allows the iframe to access cookies, localStorage, and other same-origin resources.
        // allow-forms	                            Allows the iframe to submit forms.
        // allow-popups	                            Allows the iframe to open new windows or tabs (e.g., via window.open()).
        // allow-modals	                            Allows the iframe to open modal dialogs (e.g., alert(), confirm()).
        // allow-pointer-lock	                    Allows the iframe to use the Pointer Lock API.
        // allow-orientation-lock	                Allows the iframe to lock the screen orientation.
        // allow-popups-to-escape-sandbox	        Allows popups to escape the sandbox restrictions (e.g., open a new window without sandbox).
        // allow-top-navigation	                    Allows the iframe to navigate the top-level browsing context (i.e., the parent page).
        // allow-top-navigation-by-user-activation	Allows the iframe to navigate the top-level browsing context only if triggered by user interaction (e.g., a click).
        // iframe.setAttribute('sandbox', '');
        this.applyStyles(iframe, iframeStyles);
        iframe.addEventListener('error', () => {
            const errorMessage = document.createElement('div');
            errorMessage.textContent = 'Failed to load content.';
            modalContent.appendChild(errorMessage);
            console.error('Failed to load iframe content from URL:', url);
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