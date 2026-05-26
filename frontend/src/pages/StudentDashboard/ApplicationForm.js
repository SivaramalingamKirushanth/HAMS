import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../config';
import './ApplicationForm.css';

const ApplicationForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    academicYear: '2024 / 2025',
    enrolmentNo: '',
    title: 'Mr',
    nameWithInitial: '',
    nameDenotedByInitials: '',
    sex: '',
    race: '',
    dob: '',
    nic: '',
    handPhone: '',
    email: '',
    privateEmail: '',
    permanentAddress: '',
    province: '',
    district: '',
    divisionalSecretariat: '',
    distance: '',
    residentialPhone: '',
    differentlyAbled: 'No',
    sicknessDetails: '',
    emergencyName: '',
    emergencyRelationship: '',
    emergencyContact: '',
    declarationAccepted: false,
    signatureId: null,
    photo: null,
    travelTime: '',
    userLocation: null
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [signatureError, setSignatureError] = useState('');
  const [isUploadingSignature, setIsUploadingSignature] = useState(false);
  
  // Pre-fill student data from login session
  React.useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      let autoEnrolmentNo = '';
      if (user.email) {
        let extractedPrefix = user.email.split('@')[0];
        // Try to format it as YYYY/DEP/XX (e.g. 2021ict35 -> 2021/ICT/35)
        const match = extractedPrefix.match(/^(\d{4})([a-zA-Z]+)(\d+)$/);
        if (match) {
          autoEnrolmentNo = `${match[1]}/${match[2].toUpperCase()}/${match[3]}`;
        } else {
          autoEnrolmentNo = extractedPrefix.toUpperCase();
        }
      }
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        nameWithInitial: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : prev.nameWithInitial,
        enrolmentNo: autoEnrolmentNo,
        sex: user.gender || prev.sex,
        dob: user.birthday ? new Date(user.birthday).toISOString().split('T')[0] : prev.dob,
        handPhone: user.phoneNumber || prev.handPhone,
        nic: user.nic || prev.nic
      }));
    }
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAutoDistance = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsCalculatingDistance(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const studentLat = position.coords.latitude;
        const studentLon = position.coords.longitude;

        // Coordinates for University of Vavuniya (Pampaimadu Campus)
        const uniLat = 8.7586746;
        const uniLon = 80.4106966;

        try {
          // OSRM API Request
          // Format: {longitude},{latitude};{longitude},{latitude}
          const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${studentLon},${studentLat};${uniLon},${uniLat}?overview=false`);
          const data = await response.json();

          if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
            const distanceMeters = data.routes[0].distance;
            const durationSeconds = data.routes[0].duration;

            // Transformations
            const distanceKm = (distanceMeters / 1000).toFixed(2);
            const durationMinutes = Math.round(durationSeconds / 60);

            setFormData(prev => ({ 
              ...prev, 
              distance: distanceKm,
              travelTime: durationMinutes,
              userLocation: { lat: studentLat, lon: studentLon }
            }));
          } else {
            alert("Could not calculate a route to the university.");
          }
        } catch (error) {
          console.error("OSRM API Error:", error);
          alert("Failed to connect to the routing service.");
        } finally {
          setIsCalculatingDistance(false);
        }
      },
      (error) => {
        alert("Unable to retrieve your location. Please ensure Location Services are allowed in your browser.");
        setIsCalculatingDistance(false);
      }
    );
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    let finalValue = value;

    // Strict validation: Phone numbers should only contain digits and max 10 characters
    if (name === 'handPhone' || name === 'residentialPhone' || name === 'emergencyContact') {
      finalValue = value.replace(/\D/g, ''); // Removes any non-digit character instantly
      if (finalValue.length > 10) finalValue = finalValue.slice(0, 10);
    }

    // Strict validation: Sri Lankan NIC formatting
    if (name === 'nic') {
      finalValue = value.toUpperCase().replace(/[^0-9VX]/g, ''); // Only numbers and V/X
      if (finalValue.includes('V') || finalValue.includes('X')) {
        if (finalValue.length > 10) finalValue = finalValue.slice(0, 10); // Old format
      } else {
        if (finalValue.length > 12) finalValue = finalValue.slice(0, 12); // New format
      }
    }

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : finalValue
    });
  };

  const handleSignatureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSignatureError('');

    if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
      setSignatureError('Only JPG or PNG files are allowed.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setSignatureError('File size must be less than 2MB.');
      return;
    }

    setIsUploadingSignature(true);
    const uploadData = new FormData();
    uploadData.append('signature', file);

    try {
      const response = await fetch(`${API_BASE_URL}/upload/signature`, {
        method: 'POST',
        body: uploadData
      });
      const data = await response.json();
      if (data.success) {
        setSignaturePreview(`http://localhost:5000${data.data.processed_path}`);
        setFormData(prev => ({ ...prev, signatureId: data.data.id }));
      } else {
        setSignatureError('Failed to process image. Try again.');
      }
    } catch (err) {
      setSignatureError('Network error. Failed to connect to upload service.');
    } finally {
      setIsUploadingSignature(false);
      e.target.value = null; // reset file input
    }
  };

  const clearSignature = () => {
    setSignaturePreview(null);
    setFormData(prev => ({ ...prev, signatureId: null }));
    setSignatureError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.signatureId) {
      alert("Please upload your signature before submitting.");
      return;
    }

    // Strict validation: Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address (e.g., student@stu.vau.ac.lk)!");
      return;
    }

    const finalData = { ...formData };
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/applications`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(finalData)
      });
      const data = await response.json();
      if (data.success) {
        alert('Application Submitted Successfully!');
        // Ideally navigate to status or rooms
      } else {
        alert('Error submitting application: ' + data.message);
      }
    } catch (err) {
      alert('Failed to connect to backend server.');
    }
  };

  return (
    <div className="application-form-container">
      <div className="form-header">
        <div className="header-titles">
          <h3>University of Vavuniya</h3>
          <h2>APPLICATION FOR HOSTEL ACCOMMODATION</h2>
          <div className="academic-year">
            <label>Academic Year</label>
            <select name="academicYear" value={formData.academicYear} onChange={handleChange}>
              <option value="2023 / 2024">2023 / 2024</option>
              <option value="2024 / 2025">2024 / 2025</option>
              <option value="2025 / 2026">2025 / 2026</option>
              <option value="2026 / 2027">2026 / 2027</option>
            </select>
          </div>
        </div>
        <div className="photo-box">
          {photoPreview ? (
            <img src={photoPreview} alt="Student Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span>Upload Photo</span>
          )}
          <input type="file" accept="image/*" title="Upload Photo" onChange={handlePhotoChange} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="hostel-form">
        <div className="form-group full-width">
          <label>Enrolment No:</label>
          <input type="text" name="enrolmentNo" value={formData.enrolmentNo} onChange={handleChange} required />
        </div>

        <div className="form-section">
          <div className="form-group row-group">
            <label>1. (a) Name with initial:</label>
            <select name="title" value={formData.title} onChange={handleChange}>
              <option value="Rev">Rev</option>
              <option value="Mr">Mr</option>
              <option value="Mrs">Mrs</option>
              <option value="Miss">Miss</option>
            </select>
            <input type="text" name="nameWithInitial" value={formData.nameWithInitial} onChange={handleChange} style={{ flex: 1 }} required />
          </div>

          <div className="form-group full-width">
            <label>&nbsp;&nbsp;&nbsp;&nbsp;(b) Name Denoted by the initials:</label>
            <input type="text" name="nameDenotedByInitials" value={formData.nameDenotedByInitials} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group half-width">
            <label>2. (a) Sex:</label>
            <select name="sex" value={formData.sex} onChange={handleChange} required>
              <option value="">Select...</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group half-width">
            <label>(b) Race:</label>
            <input type="text" name="race" value={formData.race} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group half-width">
            <label>3. (a) Date of Birth:</label>
            <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
          </div>
          <div className="form-group half-width">
            <label>(b) N.I.C No:</label>
            <input type="text" name="nic" value={formData.nic} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-group full-width">
          <label>4. Mobile Phone No:</label>
          <input type="tel" name="handPhone" value={formData.handPhone} onChange={handleChange} required />
        </div>

        <div className="form-group full-width">
          <label>5. (a) University E-Mail Address:</label>
          <input 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="form-group full-width">
          <label>&nbsp;&nbsp;&nbsp;&nbsp;(b) Private E-Mail Address (Optional):</label>
          <input 
            type="email" 
            name="privateEmail" 
            value={formData.privateEmail} 
            onChange={handleChange} 
            placeholder="e.g. yourname@gmail.com"
          />
        </div>

        <div className="form-group full-width">
          <label>6. (a) Permanent residential address:</label>
          <textarea name="permanentAddress" rows="3" value={formData.permanentAddress} autoComplete="off" onChange={handleChange} required></textarea>
        </div>

        <div className="subsection">
          <label className="subsection-label">(b) Details:</label>
          <div className="form-row">
            <div className="form-group half-width">
              <label>1. Province:</label>
              <select name="province" value={formData.province} onChange={handleChange} required>
                <option value="">Select Province...</option>
                <option value="Central Province">Central Province</option>
                <option value="Eastern Province">Eastern Province</option>
                <option value="North Central Province">North Central Province</option>
                <option value="Northern Province">Northern Province</option>
                <option value="North Western Province">North Western Province</option>
                <option value="Sabaragamuwa Province">Sabaragamuwa Province</option>
                <option value="Southern Province">Southern Province</option>
                <option value="Uva Province">Uva Province</option>
                <option value="Western Province">Western Province</option>
              </select>
            </div>
            <div className="form-group half-width">
              <label>2. District:</label>
              <select name="district" value={formData.district} onChange={handleChange} required>
                <option value="">Select District...</option>
                <option value="Ampara">Ampara</option>
                <option value="Anuradhapura">Anuradhapura</option>
                <option value="Badulla">Badulla</option>
                <option value="Batticaloa">Batticaloa</option>
                <option value="Colombo">Colombo</option>
                <option value="Galle">Galle</option>
                <option value="Gampaha">Gampaha</option>
                <option value="Hambantota">Hambantota</option>
                <option value="Jaffna">Jaffna</option>
                <option value="Kalutara">Kalutara</option>
                <option value="Kandy">Kandy</option>
                <option value="Kegalle">Kegalle</option>
                <option value="Kilinochchi">Kilinochchi</option>
                <option value="Kurunegala">Kurunegala</option>
                <option value="Mannar">Mannar</option>
                <option value="Matale">Matale</option>
                <option value="Matara">Matara</option>
                <option value="Moneragala">Moneragala</option>
                <option value="Mullaitivu">Mullaitivu</option>
                <option value="Nuwara Eliya">Nuwara Eliya</option>
                <option value="Polonnaruwa">Polonnaruwa</option>
                <option value="Puttalam">Puttalam</option>
                <option value="Ratnapura">Ratnapura</option>
                <option value="Trincomalee">Trincomalee</option>
                <option value="Vavuniya">Vavuniya</option>
              </select>
            </div>
          </div>
          <div className="form-group full-width">
            <label>3. Divisional Secretariat:</label>
            <input type="text" name="divisionalSecretariat" value={formData.divisionalSecretariat} onChange={handleChange} required />
          </div>
          <div className="form-group full-width distance-group">
            <label>4. Distance from residence to University of Vavuniya:</label>
            <div className="distance-input">
              <input type="number" name="distance" value={formData.distance} onChange={handleChange} required />
              <span style={{ fontWeight: 600, color: '#4a5568' }}>.KM</span>
              <button
                type="button"
                onClick={handleAutoDistance}
                className="auto-distance-btn"
                disabled={isCalculatingDistance}>
                {isCalculatingDistance ? 'Detecting...' : '📍 Auto Detect'}
              </button>
            </div>
            <p className="distance-note">
              ⚠️ Note: Please ensure that your auto-detected location is your <b>permanent address</b>. Temporary or incorrect locations may affect your application review.
            </p>
          </div>
          {(formData.travelTime || formData.userLocation) && (
            <div className="location-info-card">
              {formData.travelTime && (
                <div className="info-row">
                  <span className="info-label">Estimated Travel Time</span>
                  <span className="info-value highlight-text">{formData.travelTime} minutes</span>
                </div>
              )}
              {formData.userLocation && (
                <div className="info-row">
                  <span className="info-label">Detected Coordinates</span>
                  <span className="info-value">{formData.userLocation.lat.toFixed(5)}, {formData.userLocation.lon.toFixed(5)}</span>
                  <a 
                    href={`https://www.google.com/maps?q=${formData.userLocation.lat},${formData.userLocation.lon}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="map-link-btn">
                    View on Map
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="form-group full-width">
          <label>(c) Residential Telephone No:</label>
          <input type="tel" name="residentialPhone" value={formData.residentialPhone} onChange={handleChange} />
        </div>

        <div className="form-section">
          <div className="form-group inline-group">
            <label>7. Are you a differently abled person?</label>
            <select name="differentlyAbled" value={formData.differentlyAbled} onChange={handleChange}>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>
          {formData.differentlyAbled === 'Yes' && (
            <div className="form-group full-width" style={{ marginTop: '10px' }}>
              <label>If so, details of the sickness:</label>
              <input type="text" name="sicknessDetails" value={formData.sicknessDetails} onChange={handleChange} required />
            </div>
          )}
        </div>

        <div className="form-section">
          <label className="section-title">8. Details of the person to be informed in case of an emergency</label>
          <div className="form-group full-width">
            <label>Name:</label>
            <input type="text" name="emergencyName" value={formData.emergencyName} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <div className="form-group half-width">
              <label>Relationship:</label>
              <input type="text" name="emergencyRelationship" value={formData.emergencyRelationship} onChange={handleChange} required />
            </div>
            <div className="form-group half-width">
              <label>Contact No:</label>
              <input type="tel" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} required />
            </div>
          </div>
        </div>

        <div className="form-section declaration-section">
          <label className="declaration">
            <input type="checkbox" name="declarationAccepted" checked={formData.declarationAccepted} onChange={handleChange} required />
            <span>9. On admission to the hostel, I accept the hostel rules and regulations applicable to the student of the campus and also I hereby declare that, upon admission to the hostel, I give my consent, the amount equivalent to the replacement value plus 25% of such value for the damage/ loss of items which are provide for my use in the hostel/ rent dues from my deposit/ Bursary/ Mahapola.</span>
          </label>
        </div>

        <div className="form-section signature-section">
          <div className="form-group full-width">
            <label>Signature of the Applicant:</label>
            <div className="signature-upload-container">
              {signaturePreview ? (
                <div className="signature-preview-box">
                  <img src={signaturePreview} alt="Processed Signature" />
                  <button type="button" onClick={clearSignature} className="clear-btn">Remove Signature</button>
                </div>
              ) : (
                <div className="signature-upload-box">
                  <input 
                    type="file" 
                    accept="image/jpeg, image/png" 
                    onChange={handleSignatureUpload} 
                    id="signatureUpload"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="signatureUpload" className="upload-btn">
                    {isUploadingSignature ? 'Processing...' : 'Upload Signature Image'}
                  </label>
                  <span className="upload-hint">Format: JPG, PNG (Max 2MB)</span>
                </div>
              )}
              {signatureError && <div className="error-text">{signatureError}</div>}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn primary">Submit Application</button>
        </div>
      </form>
    </div>
  );
};

export default ApplicationForm;
