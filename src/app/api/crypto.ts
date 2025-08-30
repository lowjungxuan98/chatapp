import * as argon2 from 'argon2';

const encrypt = (password: string) => argon2.hash(password);
const verify = (hash: string, password: string) => argon2.verify(hash, password);

export { encrypt, verify };