export function sanitizeString( message ) {
    return message.replace(/(<([^>]+)>)/ig,'').substring(0, 35);
}