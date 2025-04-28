export const unsplash = term =>
    `https://source.unsplash.com/400x300/?${encodeURIComponent(term.toLowerCase())}`;

export const getImageSrc = product =>
    product.imageUrl || unsplash(product.name);

export const handleImgError = (e, name) => {
  e.target.onerror = null;
  e.target.src = unsplash(name);
};
