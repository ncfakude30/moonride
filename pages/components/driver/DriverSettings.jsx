import React, { useState, useEffect } from "react";
import { setDriverSettings, fetchDriverSettings } from '../../api/api.service'; // Add fetchDriverSettings
import tw from 'tailwind-styled-components';

const DriverSettings = ({ user }) => {
  const [editingSection, setEditingSection] = useState(null); // To track the current editing section
  const [formData, setFormData] = useState({
    profile: { name: "", phone: "" },
    carDetails: { carName: "", carPlate: "" },
    bankingDetails: {
      bankName: "",
      accountHolder: "",
      accountNumber: "",
      bankCode: ""
    },
  });

  const [loading, setLoading] = useState(false); // Loader state
  const [settings, setSettings] = useState(null); // Moved settings here

  // Fetch the settings when the component mounts
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await fetchDriverSettings(user?.id); // Fetch settings using the user ID
        setSettings(res);
        setFormData({
          profile: { name: res?.profile?.name || user?.displayName, phone: res?.profile?.phone || user?.email },
          carDetails: { carName: res?.carDetails?.carName || "", carPlate: res?.carDetails?.carPlate || "" },
          bankingDetails: {
            bankName: res?.bankingDetails?.bankName || "",
            accountHolder: res?.bankingDetails?.accountHolder || "",
            accountNumber: res?.bankingDetails?.accountNumber || "",
            bankCode: res?.bankingDetails?.bankCode || ""
          },
        });
      } catch (err) {
        console.error("Error fetching settings:", err);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    if (user?.id) {
      fetchSettings(); // Only fetch settings if user exists
    }
  }, [user]);

  const handleEdit = (section) => {
    setEditingSection(section); // Set the section being edited
  };

  const handleSave = (section) => {
    const updatedData = {
      ...formData,
      [section]: formData[section], // Only update the section being edited
    };

    setLoading(true); // Start loading
    setDriverSettings(updatedData)
      .then(() => {
        setEditingSection(null); // Stop editing mode
        alert(`${section} updated successfully!`);
      })
      .catch((err) => console.error(`Error saving ${section}:`, err))
      .finally(() => setLoading(false)); // Stop loading
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Split the name to find the nested object (e.g., profile.name or bankingDetails.bankName)
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
      {loading && (
          <LoadingWrapper>
            <Loader />
            <LoadingMessage>Loading settings...</LoadingMessage>
          </LoadingWrapper>
      )}
      {settings && (
        <div className="settings-cards">
          {/* Profile Settings Card */}
          <div className="card">
            <h3>Profile Settings</h3>
            {editingSection === 'profile' ? (
              <div>
                <input
                  type="text"
                  name="profile.name"
                  value={formData.profile.name || user?.displayName}
                  onChange={handleChange}
                  placeholder="Name"
                />
                <input
                  type="text"
                  name="profile.phone"
                  value={formData.profile.phone || user?.email}
                  onChange={handleChange}
                  placeholder="Phone"
                />
                <button onClick={() => handleSave('profile')}>Save</button>
              </div>
            ) : (
              <div>
                <p>Name: {settings.profile?.name || user?.displayName}</p>
                <p>Phone: {settings.profile?.phone || user?.email}</p>
                <button onClick={() => handleEdit('profile')}>Edit</button>
              </div>
            )}
          </div>

          {/* Car Management Card */}
          <div className="card">
            <h3>Car Management</h3>
            {editingSection === 'carDetails' ? (
              <div>
                <input
                  type="text"
                  name="carDetails.carName"
                  value={formData.carDetails.carName}
                  onChange={handleChange}
                  placeholder="Car Name"
                />
                <input
                  type="text"
                  name="carDetails.carPlate"
                  value={formData.carDetails.carPlate}
                  onChange={handleChange}
                  placeholder="Car Plate"
                />
                <button onClick={() => handleSave('carDetails')}>Save</button>
              </div>
            ) : (
              <div>
                <p>Car Name: {settings.carDetails?.carName}</p>
                <p>Car Plate: {settings.carDetails?.carPlate}</p>
                <button onClick={() => handleEdit('carDetails')}>Edit</button>
              </div>
            )}
          </div>

          {/* Banking Details Card */}
          <div className="card">
            <h3>Banking Details</h3>
            {editingSection === 'bankingDetails' ? (
              <div>
                <input
                  type="text"
                  name="bankingDetails.bankName"
                  value={formData.bankingDetails.bankName}
                  onChange={handleChange}
                  placeholder="Bank Name"
                />
                <input
                  type="text"
                  name="bankingDetails.accountHolder"
                  value={formData.bankingDetails.accountHolder}
                  onChange={handleChange}
                  placeholder="Account Holder"
                />
                <input
                  type="text"
                  name="bankingDetails.accountNumber"
                  value={formData.bankingDetails.accountNumber}
                  onChange={handleChange}
                  placeholder="Account Number"
                />
                <input
                  type="text"
                  name="bankingDetails.bankCode"
                  value={formData.bankingDetails.bankCode}
                  onChange={handleChange}
                  placeholder="Bank Code"
                />
                <button onClick={() => handleSave('bankingDetails')}>Save</button>
              </div>
            ) : (
              <div>
                <p>Bank Name: {settings.bankingDetails?.bankName}</p>
                <p>Account Holder: {settings.bankingDetails?.accountHolder}</p>
                <p>Account Number: {settings.bankingDetails?.accountNumber}</p>
                <p>Bank Code: {settings.bankingDetails?.bankCode}</p>
                <button onClick={() => handleEdit('bankingDetails')}>Edit</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverSettings;


const LoadingPopup = tw.div`
  fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-70
`;

const LoadingWrapper = tw.div`
  flex flex-col items-center justify-center py-6
`;

const LoadingMessage = tw.div`
  text-gray-700 font-semibold text-center py-4 text-center text-xs py-2
`;

const Loader = tw.div`
  w-16 h-16 border-4 border-dashed rounded-full animate-spin border-gray-500
`;
