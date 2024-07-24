export const isHTML = (response: {}) => {
    const htmlPattern = /<([a-z][\s\S]*>)/i;
    return typeof response === "string" && htmlPattern.test(response);
};
