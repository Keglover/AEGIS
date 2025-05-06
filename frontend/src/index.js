import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';
import 'antd/dist/reset.css';
import { message } from 'antd';
message.error('Testing AntD message popup');



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
