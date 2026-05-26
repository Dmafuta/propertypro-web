import { products } from 'data/e-commerce/products';
import { ProductDetails } from 'types/ecommerce';

export const sendPasswordResetLinkFetcher = (): Promise<{ message: string }> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve({ message: 'Reset link sent' });
    }, 1000);
  });

export const productFetcher = (
  args: [string, { productId: string }],
): Promise<ProductDetails | null> => {
  const [_url, { productId }] = args;

  return new Promise((resolve) => {
    setTimeout(() => {
      const product = products.find((product) => product.id === Number(productId));

      resolve(product || null);
    }, 1000);
  });
};
