
export function isValidFullName(fullName: string): boolean {
    const fullNameRegex = /^[a-zA-Z\s]{3,}$/;
    return fullNameRegex.test(fullName);
}