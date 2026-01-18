export const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        const randomIndex = crypto.getRandomValues(new Uint32Array(1))[0] % 16;
        color += letters[randomIndex];
    }
    return color;
};