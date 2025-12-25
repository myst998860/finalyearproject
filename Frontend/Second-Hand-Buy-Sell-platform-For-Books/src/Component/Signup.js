import React, { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Form, Input, Button, Typography } from 'antd';
import { UserOutlined, MailOutlined, EyeOutlined, GoogleOutlined } from '@ant-design/icons';
import logo from '../Component/assests/hand-keep-book-read-source-600nw-1127076767-removebg-preview.png';
import { toast } from 'react-toastify';

const { Title, Text, Link } = Typography;

const Signup = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = (values) => {
    setLoading(true);
    console.log('Signup values:', values);
    setTimeout(() => {
      setLoading(false);
      toast.success('Signup successful!');
    }, 1000);
  };

  return (
    <div>
    <Navbar/>
    <div className="login-container">
      <div className="login-content">
        {/* Left Image Section */}
        <div className="books-section">
          <div className="books-stack" />
        </div>

        {/* Right Signup Section */}
        <div className="login-form-section">
          <div className="login-header">
            <Title level={2} className="welcome-title">
              Join Book Bridge!
              <img src={logo} alt="Book Bridge Logo" className="logo-image" />
            </Title>
            <Text className="welcome-description">
              Create your account and start enjoying the benefits of selling and exchanging books easily and efficiently.
            </Text>
          </div>

          <Title level={3} className="login-subtitle">
            Create Your Account
          </Title>

          <Form
            form={form}
            name="signup_form"
            className="login-form"
            onFinish={onFinish}
            layout="vertical"
          >
            <Form.Item
              name="name"
              rules={[{ required: true, message: 'Please enter your full name!' }]}
            >
              <Input
                prefix={<UserOutlined className="input-icon" />}
                placeholder="Full Name"
                className="login-input"
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[{ required: true, message: 'Please enter your email!' }]}
            >
              <Input
                prefix={<MailOutlined className="input-icon" />}
                placeholder="Enter Email"
                className="login-input"
                suffix={<span className="email-suffix">@</span>}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please enter your password!' }]}
            >
              <Input.Password
                prefix={<EyeOutlined className="input-icon" />}
                placeholder="Enter Password"
                className="login-input"
                iconRender={visible => <EyeOutlined className="eye-icon" />}
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please confirm your password!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject('Passwords do not match!');
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<EyeOutlined className="input-icon" />}
                placeholder="Confirm Password"
                className="login-input"
                iconRender={visible => <EyeOutlined className="eye-icon" />}
              />
            </Form.Item>

            <div className="account-prompt">
              <Text>Already have an account?</Text>
              <Link href="/login" className="create-account-link">
                Login
              </Link>
            </div>

            <div className="login-buttons">
              <Button
                type="default"
                icon={<GoogleOutlined />}
                className="google-button"
              />
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="login-button"
              >
                SIGN UP
              </Button>
            </div>
          </Form>
        </div>
      </div>

      {/* Styles (copied and adapted from Login.js) */}
      <style jsx>{`
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: #f7faff;
          padding: 20px;
        }

        .login-content {
          display: flex;
          width: 100%;
          max-width: 1100px;
          background-color: #fff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          border: 1px solid #e6e9f0;
        }

        .books-section {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #fff;
          padding: 40px;
        }

        .books-stack {
          width: 100%;
          height: 100%;
          max-width: 400px;
          background-image: url('https://t3.ftcdn.net/jpg/03/41/64/12/360_F_341641286_3PsasOhbu2STmLNAfTwXx5dsmxRgZ3qT.jpg');
          background-size: contain;
          background-position: center;
          background-repeat: no-repeat;
        }

        .login-form-section {
          flex: 1.2;
          padding: 50px;
          display: flex;
          flex-direction: column;
          background-color: #f7faff;
        }

        .login-header {
          margin-bottom: 30px;
          text-align: left;
        }

        .welcome-title {
          color: #16A2F1;
          margin-bottom: 12px;
          font-size: 2rem;
          font-weight: 700;
          display: flex;
          align-items: center;
        }
        .logo-image {
          width: 40px;
          height: 40px;
          margin-left: 15px;
        }
        .welcome-description {
          color: #555;
          font-size: 1rem;
          line-height: 1.6;
          max-width: 450px;
        }
        .login-subtitle {
          color: #16A2F1;
          margin-bottom: 24px;
          text-align: left;
          font-size: 1.5rem;
          font-weight: 600;
        }
        .login-form {
          width: 100%;
        }
        .login-input {
          height: 50px;
          background-color: #e3f2fd;
          border: 1px solid #bbdefb;
          border-radius: 8px;
          font-size: 1rem;
          padding: 0 15px;
        }
        .login-input .ant-input {
          background-color: transparent !important;
        }
        .input-icon {
          color: #90caf9;
        }
        .email-suffix {
          color: #90caf9;
        }
        .eye-icon {
          color: #90caf9;
        }
        .form-actions {
          text-align: right;
          margin-bottom: 20px;
        }
        .forgot-password {
          color: #555;
          font-size: 0.9rem;
        }
        .account-prompt {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }
        .account-prompt Text {
          color: #555;
          font-size: 0.9rem;
        }
        .create-account-link {
          color: #007bff;
          font-weight: 600;
          font-size: 0.9rem;
        }
        .login-buttons {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .google-button {
          background-color: #fff;
          border: 1px solid #ddd;
          border-radius: 8px;
          height: 40px;
          width: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #db4437;
          font-size: 1.2rem;
        }
        .login-button {
          background-color: #28a745;
          border-color: #28a745;
          height: 40px;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          flex-grow: 1;
          margin-left: 10px;
        }
        .login-button:hover {
          background-color: #218838;
          border-color: #1e7e34;
        }
      `}</style>
    </div>
     <Footer />
    </div>
  );
};

export default Signup;
