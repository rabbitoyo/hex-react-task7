export const getToken = (name = 'hexToken') => {
    const cookie = document.cookie.split('; ').find((row) => row.startsWith(name + '='));
    return cookie ? cookie.split('=')[1] : null;
};

export const setToken = (token, expired) => {
    // 先清除舊的 Token，避免重複設置問題
    removeToken();
    // 設置新的 Token
    document.cookie = `hexToken=${token}; expires=${new Date(expired)}; path=/;`;
};

export const removeToken = () => {
    // 設置過期時間為過去，確保 Cookie 被刪除
    document.cookie = 'hexToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'hexToken=; max-age=0; path=/;';
};
