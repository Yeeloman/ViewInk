# ViewInk

ViewInk is a lightweight, dynamic, and customizable modal popup library for web applications. It allows you to easily create and manage modal windows that display content from a specified URL. ViewInk supports dynamic URL construction using path and query parameters, making it ideal for scenarios like e-commerce product previews, virtual try-ons, or any other use case where you need to display content in a modal.

## Features

- **Dynamic URL Support:** Use placeholders like `:name` and `:slug` in the URL to dynamically construct the modal content URL.
- **Customizable:** Add your own CSS classes to style the modal or use the built-in default styles. (not done yet)
- **Event Hooks:** Execute custom actions when the modal opens or closes using `onOpen` and `onClose` callbacks.
- **Lightweight:** Minimal dependencies and easy to integrate into any project.
- **Cross-Framework Compatibility:** Works with any JavaScript framework or vanilla JavaScript.

## Installation

You can install ViewInk via npm:

```bash
npm install ViewInk
```

### API Reference

#### `ModalPopupConfig`

| Property | Type | Description |
|----------|------|-------------|
| `url`    | `string` | The base URL for the modal. Use placeholders like `:store_name` and `:product_slug` for dynamic path segments. |
| `onOpen` | `() => void` | Callback function executed when the modal is opened. |
| `onClose` | `() => void` | Callback function executed when the modal is closed. |

#### `ModalPopup`

| Method | Description |
|--------|-------------|
| `openPopup(pathParams: Record<string, string>, queryParams: Record<string, string>)` | Opens the modal with the specified path and query parameters. |
| `closePopup()` | Closes the currently open modal. |

#### `createModalPopup(config: ModalPopupConfig): ModalPopup`

Creates and returns a new instance of `ModalPopup` using the provided configuration.

## Example Use Case

ViewInk is perfect for e-commerce websites where you want to display product previews or virtual try-ons in a modal. For example:

```javascript
import { createModalPopup } from 'ViewInk';

const modal = createModalPopup({
    url: 'http://127.0.0.1/:store_name/:product_slug/',
});

// When a user clicks on a product
modal.openPopup(
    { store_name: 'store', product_slug: '666' },
    { color: 'black', size: 'medium' }
);
```

the modal will open in `http://127.0.0.1/store/666?color=black&size=medium`

## Browser Compatibility

The `ModalPopup` library is designed to work in modern web browsers. It uses standard DOM APIs and should be compatible with any browser that supports ES6+ features.

---

## Contributing

Contributions are welcome! If you'd like to contribute to ViewInk, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Commit your changes and push to your fork.
4. Submit a pull request.

## License

This project is licensed under the MIT License

## Acknowledgments

- Thanks to all contributors who have helped improve this library.
