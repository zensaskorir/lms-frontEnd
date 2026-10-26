
export function escapeHTML(value = "") {
    const characters = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    };

    return String(value).replace(
        /[&<>"']/g,
        character => characters[character]
    );
}
