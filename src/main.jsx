import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store/store';
import { RouterProvider } from 'react-router';
import router from './router';

// Bootstrap
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './assets/scss/all.scss';

// Components
import MessageToast from './components/common/MessageToast';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Provider store={store}>
            <MessageToast />
            <RouterProvider router={router} />
        </Provider>
    </StrictMode>
);
