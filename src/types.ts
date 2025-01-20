export type ModalPopupConfig = {
    url?: string;
    onClose?: () => void;
    onOpen?: () => void;
    styles?: {
        container?: Record<string, string>;
        content?: Record<string, string>;
        iframe?: Record<string, string>;
    };
    sandbox?: string;
    // flags?: string[];
};