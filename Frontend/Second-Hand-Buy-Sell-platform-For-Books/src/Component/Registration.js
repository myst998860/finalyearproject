import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Tabs,
  Typography,
  Upload,
} from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import Navbar from './Navbar';
import Footer from './Footer';
import { register } from '../services/api'; // ✅ API import
import { toast } from 'react-toastify';

const { Title, Text, Link } = Typography;
const { TabPane } = Tabs;
const { Dragger } = Upload;

const Registration = () => {
  const [form] = Form.useForm();
  const [accountType, setAccountType] = useState('individual');
  const [loading, setLoading] = useState(false);

  const onTabChange = (key) => {
    setAccountType(key);
    form.resetFields();
  };

  const draggerProps = {
    beforeUpload: () => false,
    multiple: false,
    accept: '.png,.jpg,.jpeg,.pdf',
  };

  const onFinish = async (values) => {
    const formData = new FormData();

    if (accountType === 'individual') {
      formData.append('fullName', values.fullName);
      formData.append('email', values.email);
      formData.append('password', values.password);
      if (values.idCardNumber) {
        formData.append('idCardNumber', values.idCardNumber);
      }
      formData.append('location', values.location);
      formData.append('phone', values.phone);

      const file = values.upload?.[0]?.originFileObj;
      if (file) {
        formData.append('idCardPhoto', file);
      }
    } else {
      formData.append('organizationName', values.organizationName);
      formData.append('contactPerson', values.contactPerson);
      formData.append('email', values.email);
      formData.append('password', values.password);
      formData.append('businessRegistrationNumber', values.businessRegistrationNumber);
      formData.append('panNumber', values.panNumber);
      formData.append('location', values.location);
      formData.append('phone', values.phone);

      const file = values.upload?.[0]?.originFileObj;
      if (file) {
        formData.append('documentPhoto', file);
      }
    }

    setLoading(true);
    try {
      await register(accountType, formData); // ✅ Uses api.js
      toast.success('Registration successful!');
      form.resetFields();
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: 500, margin: '0 auto', padding: 20 }}>
        <Title level={3} style={{ textAlign: 'center', color: '#1ABC9C' }}>
          Welcome to Book Bridge!
        </Title>
        <Text style={{ display: 'block', textAlign: 'center', marginBottom: 10 }}>
          Choose your account type and fill in the details below.
        </Text>

        <Tabs defaultActiveKey="individual" onChange={onTabChange} centered>
          <TabPane tab="Individual" key="individual" />
          <TabPane tab="Organization" key="organization" />
        </Tabs>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ marginTop: 10 }}
        >
          {accountType === 'individual' ? (
            <>
              <Form.Item
                label="Full Name"
                name="fullName"
                rules={[{ required: true, message: 'Please enter your full name' }]}
              >
                <Input placeholder="Enter your full name" />
              </Form.Item>

              <Form.Item
                label="ID Card Number"
                name="idCardNumber"
              >
                <Input placeholder="Enter your ID card number (optional)" />
              </Form.Item>

              <Form.Item
                label="Location"
                name="location"
                rules={[{ required: true, message: 'Please enter your location' }]}
              >
                <Input placeholder="Enter your location" />
              </Form.Item>

              <Form.Item
                label="Phone Number"
                name="phone"
                rules={[{ required: true, message: 'Please enter your phone number' }]}
              >
                <Input placeholder="Enter your phone number" />
              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item
                label="Organization Name"
                name="organizationName"
                rules={[{ required: true, message: 'Please enter organization name' }]}
              >
                <Input placeholder="Enter organization name" />
              </Form.Item>

              <Form.Item
                label="Contact Person"
                name="contactPerson"
                rules={[{ required: true, message: 'Please enter contact person name' }]}
              >
                <Input placeholder="Enter contact person" />
              </Form.Item>

              <Form.Item
                label="Business Registration Number"
                name="businessRegistrationNumber"
                rules={[{ required: true, message: 'Please enter registration number' }]}
              >
                <Input placeholder="Enter registration number" />
              </Form.Item>

              <Form.Item
                label="PAN Number"
                name="panNumber"
                rules={[{ required: true, message: 'Please enter PAN number' }]}
              >
                <Input placeholder="Enter PAN number" />
              </Form.Item>

              <Form.Item
                label="Location"
                name="location"
                rules={[{ required: true, message: 'Please enter location' }]}
              >
                <Input placeholder="Enter location" />
              </Form.Item>

              <Form.Item
                label="Phone Number"
                name="phone"
                rules={[{ required: true, message: 'Please enter phone number' }]}
              >
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </>
          )}

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input placeholder="Enter your email" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: 'Please enter your password' },
              { min: 8, message: 'Password must be at least 8 characters' },
            ]}
          >
            <Input.Password placeholder="Enter your password" />
          </Form.Item>

          <Form.Item
            label={accountType === 'individual' ? 'Upload ID Card' : 'Upload Registration Document'}
            name="upload"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
            rules={[{ required: true, message: 'Please upload a file' }]}
          >
            <Dragger {...draggerProps}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag file to upload</p>
              <p className="ant-upload-hint">Accepts PNG, JPG, or PDF files</p>
            </Dragger>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{ backgroundColor: '#1ABC9C', borderColor: '#1ABC9C' }}
            >
              Register
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center' }}>
          <Text>Have an account? </Text>
          <Link href="#" style={{ color: '#1ABC9C' }}>
            Sign in
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Registration;
