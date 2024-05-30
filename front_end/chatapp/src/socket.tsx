import {io} from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
console.log('Does email exist', sessionStorage.getItem('emailVal'));
export const socket = io('http://localhost:3000', {
    autoConnect: false,
    query: {
        token: sessionStorage.getItem('tokenVal'),
        email: sessionStorage.getItem('emailVal')
    }
});
