import { createAuthClient } from '@neondatabase/auth/next';
const client = createAuthClient();
console.log(client.signIn.social.toString());
