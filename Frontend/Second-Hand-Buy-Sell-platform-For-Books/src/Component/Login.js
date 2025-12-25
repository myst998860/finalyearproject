import React, { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Form, Input, Button } from 'antd';
import { MailOutlined, LockOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { login } from '../services/api';
import { toast } from 'react-toastify';

const Login = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const data = await login(values.email, values.password);
      localStorage.setItem('user', JSON.stringify({
        token: data.token,
        userId: data.user.id,
        email: data.user.email,
        fullName: data.user.fullName,
        userType: data.user.userType,
      }));
      toast.success('Login successful!');
      setTimeout(() => {
        window.location.href = '/search';
      }, 1200);
    } catch (error) {
      toast.error(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      
      {/* Main Container */}
      <div style={{
        minHeight: 'calc(100vh - 140px)',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px'
      }}>
        
        {/* Card */}
        <div style={{
          display: 'flex',
          width: '100%',
          maxWidth: '950px',
          minHeight: '520px',
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          
          {/* Left Side - Green */}
          <div style={{
            width: '400px',
            background: 'linear-gradient(160deg, #059669 0%, #10b981 100%)',
            padding: '50px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📚</div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '15px', color: 'white' }}>
              Book Bridge
            </h1>
            <p style={{ fontSize: '16px', opacity: '0.9', lineHeight: '1.6', marginBottom: '30px' }}>
              Connect with book lovers. Buy, sell, and exchange your favorite reads.
            </p>
            <div style={{ textAlign: 'left', width: '100%', paddingLeft: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>✓</span>
                <span>Thousands of books available</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>✓</span>
                <span>Safe & secure transactions</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>✓</span>
                <span>Connect with local readers</span>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div style={{
            flex: '1',
            padding: '50px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            background: '#fff'
          }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111', marginBottom: '8px' }}>
              Welcome Back!
            </h2>
            <p style={{ color: '#666', fontSize: '16px', marginBottom: '30px' }}>
              Please sign in to your account
            </p>

            <Form form={form} onFinish={onFinish} layout="vertical">
              <Form.Item
                name="email"
                label={<span style={{ fontWeight: '600', color: '#333' }}>Email Address</span>}
                rules={[{ required: true, message: 'Please enter your email!' }]}
              >
                <Input
                  prefix={<MailOutlined style={{ color: '#999' }} />}
                  placeholder="you@example.com"
                  size="large"
                  style={{
                    height: '50px',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    background: '#f9fafb'
                  }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={<span style={{ fontWeight: '600', color: '#333' }}>Password</span>}
                rules={[{ required: true, message: 'Please enter your password!' }]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#999' }} />}
                  placeholder="Enter your password"
                  size="large"
                  iconRender={(visible) => visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                  style={{
                    height: '50px',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    background: '#f9fafb'
                  }}
                />
              </Form.Item>

              <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                <a href="/forget-password" style={{ color: '#10b981', fontWeight: '600' }}>
                  Forgot Password?
                </a>
              </div>

              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{
                  height: '50px',
                  fontSize: '16px',
                  fontWeight: '600',
                  borderRadius: '8px',
                  background: '#10b981',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
                }}
              >
                Sign In
              </Button>

              <div style={{ textAlign: 'center', marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                <span style={{ color: '#666' }}>Don't have an account? </span>
                <a href="/signup" style={{ color: '#10b981', fontWeight: '600' }}>Create Account</a>
              </div>
            </Form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Login;
