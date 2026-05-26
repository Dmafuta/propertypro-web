import { FirebaseError } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { firebaseAuth } from 'services/firebase/firebase';

export const firebaseLoginProviderConfig = {
  id: 'firebase-login',
  name: 'Firebase Login',
  credentials: {
    email: { label: 'Email', type: 'text' },
    password: { label: 'Password', type: 'password' },
  },

  async authorize(credentials: Record<'email' | 'password', string> | undefined): Promise<any> {
    if (credentials) {
      try {
        const userCredential = await signInWithEmailAndPassword(
          firebaseAuth,
          credentials.email,
          credentials.password,
        );

        const user = userCredential.user;

        return {
          name: user.displayName,
          email: user.email,
          image: user.photoURL,
        };
      } catch (caughtError: unknown) {
        console.log({ error: caughtError });

        const message =
          caughtError instanceof FirebaseError
            ? caughtError.message
            : caughtError instanceof Error
              ? caughtError.message
              : 'Firebase login failed';

        throw new Error(message, { cause: caughtError });
      }
    }

    return null;
  },
};

export const firebaseSignupProviderConfig = {
  id: 'firebase-signup',
  name: 'Firebase Signup',
  credentials: {
    name: { label: 'Name', type: 'text' },
    email: { label: 'Email', type: 'text' },
    password: { label: 'Password', type: 'password' },
  },

  async authorize(
    credentials: Record<'email' | 'password' | 'name', string> | undefined,
  ): Promise<any> {
    if (credentials) {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          firebaseAuth,
          credentials.email,
          credentials.password,
        );

        const user = userCredential.user;

        if (user) {
          await updateProfile(user, {
            displayName: credentials.name,
          });
        }

        return {
          name: user.displayName,
          email: user.email,
          image: user.photoURL,
        };
      } catch (caughtError: unknown) {
        console.log({ error: caughtError });

        const message =
          caughtError instanceof FirebaseError
            ? caughtError.message
            : caughtError instanceof Error
              ? caughtError.message
              : 'Firebase signup failed';

        throw new Error(message, { cause: caughtError });
      }
    }

    return null;
  },
};
