import React, { useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import tw from 'tailwind-styled-components';
import { fetchDriverSettings, setDriverSettings } from '../../api/api.service';

const DriverSettings = ({ user, settings }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    profile: { name: settings?.profile?.name || "", phone: settings?.profile?.phone || "" },
    carDetails: { carName: settings?.carDetails?.carName || "", carPlate: settings?.carDetails?.carPlate || "" },
    bankingDetails: {
      bankName: settings?.bankingDetails?.bankName || "",
      accountHolder: settings?.bankingDetails?.accountHolder || "",
      accountNumber: settings?.bankingDetails?.accountNumber || "",
      bankCode: settings?.bankingDetails?.bankCode || ""
    },
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setDriverSettings(formData)
      .then(() => {
        setIsEditing(false);
        alert("Settings updated successfully!");
      })
      .catch((err) => console.error("Error saving settings:", err));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Split the name to find the nested object
    const keys = name.split(".");
    setFormData((prev) => {
      const newData = { ...prev };
      let temp = newData;

      // Navigate through the keys to set the value correctly
      keys.forEach((key, index) => {
        if (index === keys.length - 1) {
          temp[key] = value; // Set the value at the deepest level
        } else {
          if (!temp[key]) {
            temp[key] = {}; // Create nested object if it doesn't exist
          }
          temp = temp[key];
        }
      });

      return newData;
    });
  };

  return (
    <div className="settings-page">
      {settings && (
        <div className="settings-cards">
          {/* Profile Settings Card */}
          <div className="card">
            <h3>Profile Settings</h3>
            {isEditing ? (
              <div>
                <input
                  type="text"
                  name="profile.name"
                  value={formData.profile?.name}
                  onChange={handleChange}
                  placeholder="Name"
                />
                <input
                  type="text"
                  name="profile.phone"
                  value={formData.profile?.phone}
                  onChange={handleChange}
                  placeholder="Phone"
                />
              </div>
            ) : (
              <div>
                <p>Name: {settings?.profile?.name}</p>
                <p>Phone: {settings?.profile?.phone}</p>
              </div>
            )}
            <button onClick={handleEdit}>Edit</button>
          </div>

          {/* Car Management Card */}
          <div className="card">
            <h3>Car Management</h3>
            {isEditing ? (
              <div>
                <input
                  type="text"
                  name="carDetails.carName"
                  value={formData.carDetails?.carName}
                  onChange={handleChange}
                  placeholder="Car Name"
                />
                <input
                  type="text"
                  name="carDetails.carPlate"
                  value={formData.carDetails?.carPlate}
                  onChange={handleChange}
                  placeholder="Car Plate"
                />
              </div>
            ) : (
              <div>
                <p>Car Name: {settings.carDetails?.carName}</p>
                <p>Car Plate: {settings.carDetails?.carPlate}</p>
              </div>
            )}
            <button onClick={handleEdit}>Edit</button>
          </div>

          {/* Banking Details Card */}
          <div className="card">
            <h3>Banking Details</h3>
            {isEditing ? (
              <div>
                <input
                  type="text"
                  name="bankingDetails.bankName"
                  value={formData.bankingDetails?.bankName}
                  onChange={handleChange}
                  placeholder="Bank Name"
                />
                <input
                  type="text"
                  name="bankingDetails.accountHolder"
                  value={formData.bankingDetails?.accountHolder}
                  onChange={handleChange}
                  placeholder="Account Holder"
                />
                <input
                  type="text"
                  name="bankingDetails.accountNumber"
                  value={formData.bankingDetails?.accountNumber}
                  onChange={handleChange}
                  placeholder="Account Number"
                />
                <input
                  type="text"
                  name="bankingDetails.bankCode"
                  value={formData.bankingDetails?.bankCode}
                  onChange={handleChange}
                  placeholder="Bank Code"
                />
              </div>
            ) : (
              <div>
                <p>Bank: {settings.bankingDetails?.bankName}</p>
                <p>Account Holder: {settings.bankingDetails?.accountHolder}</p>
                <p>Account Number: **** **** {settings.bankingDetails?.accountNumber.slice(-4)}</p>
                <p>Bank Code: {settings.bankingDetails?.bankCode}</p>
              </div>
            )}
            <button onClick={handleEdit}>Edit</button>
          </div>

          {isEditing && <button onClick={handleSave}>Save</button>}
        </div>
      )}
    </div>
  );
};

export default DriverSettings;
