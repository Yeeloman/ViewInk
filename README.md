# ViewInk

ViewInk is a lightweight, dynamic, and customizable modal popup library for web applications. It allows you to easily create and manage modal windows that display content from a specified URL. ViewInk supports dynamic URL construction using path and query parameters, making it ideal for scenarios like e-commerce product previews, virtual try-ons, or any other use case where you need to display content in a modal.

---

## Features

- **Dynamic URL Support:** Use placeholders like `:name` and `:slug` in the URL to dynamically construct the modal content URL.
- **Customizable Styles:** Pass custom styles for the modal container, content, and iframe, or use the built-in default styles.
- **Event Hooks:** Execute custom actions when the modal opens or closes using `onOpen` and `onClose` callbacks.
- **Sandbox Security:** Configure the iframe's `sandbox` attribute for enhanced security.
- **Lightweight:** Minimal dependencies and easy to integrate into any project.
- **Cross-Framework Compatibility:** Works with any JavaScript framework or vanilla JavaScript.

---

## Installation

You can install ViewInk via npm:

```bash
npm install viewink
```
or import it directly from a CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/viewink"></script>
---

## API Reference

### `ModalPopupConfig`

| Property | Type | Description |
|----------|------|-------------|
| `url`    | `string` | The base URL for the modal. Use placeholders like `:store_name` and `:product_slug` for dynamic path segments. |
| `onOpen` | `() => void` | Callback function executed when the modal is opened. |
| `onClose` | `() => void` | Callback function executed when the modal is closed. |
| `styles` | `{ container?: Record<string, string>, content?: Record<string, string>, iframe?: Record<string, string> }` | Optional custom styles for the modal container, content, and iframe. |
| `sandbox` | `string` | Optional sandbox flags for the iframe (e.g., `allow-scripts allow-same-origin`). |

### `ModalPopup`

| Method | Description |
|--------|-------------|
| `openPopup(pathParams: Record<string, string>, queryParams: Record<string, string>)` | Opens the modal with the specified path and query parameters. |
| `closePopup()` | Closes the currently open modal. |

### `createModalPopup(config: ModalPopupConfig): ModalPopup`

Creates and returns a new instance of `ModalPopup` using the provided configuration.

---

## Example Use Case

ViewInk is perfect for e-commerce websites where you want to display product previews or virtual try-ons in a modal. For example:

```javascript
import { createModalPopup } from 'viewink';

const modal = createModalPopup({
    url: 'http://127.0.0.1/:name/:slug/',
    styles: {
        container: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)', // Darker background
        },
        content: {
            width: '90%', // Wider content area
        },
        iframe: {
            height: '90vh', // Taller iframe
        },
    },
    sandbox: 'allow-scripts allow-same-origin', // Custom sandbox flags
    onOpen: () => console.log('Modal opened!'),
    onClose: () => console.log('Modal closed!'),
});

// When a user clicks on a product
modal.openPopup(
    { store_name: 'store', product_slug: '666' },
    { color: 'black', size: 'medium' }
);
```

The modal will open at `http://127.0.0.1/store/666?color=black&size=medium`.

---

## Default Styles and Sandbox

ViewInk provides default styles and sandbox configurations that you can use or override.

### **Default Styles**

```typescript
const STYLES = {
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
```

### **Default Sandbox**

```typescript
const SANDBOX = 'allow-scripts allow-same-origin';
```

---

## Browser Compatibility

The `ViewInk` library is designed to work in modern web browsers. It uses standard DOM APIs and should be compatible with any browser that supports ES6+ features.

---

## Contributing

Contributions are welcome! If you'd like to contribute to ViewInk, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Commit your changes and push to your fork.
4. Submit a pull request.

---

## License

This project is licensed under the MIT License.

---

## Acknowledgments

- Thanks to all contributors who have helped improve this library.
