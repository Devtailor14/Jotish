import { useParams, useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect, useCallback } from 'react';
import { useData } from '../context/DataContext';
import { useCamera } from '../hooks/useCamera';
import { mergePhotoAndSignature } from '../utils/api';
import styles from '../styles/Details.module.css';

export default function Details() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { employees, setMergedImage } = useData();
  const employee = employees[parseInt(id)] || null;

  const { videoRef, isStreaming, capturedImage, error: cameraError, startCamera, capture, retake, stopCamera } = useCamera();

  const signatureCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [mergedResult, setMergedResult] = useState(null);

  // Setup canvas sizing when captured image is available
  useEffect(() => {
    if (capturedImage && signatureCanvasRef.current) {
      const canvas = signatureCanvasRef.current;
      const parent = canvas.parentElement;
      // Set canvas resolution to match the displayed size
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [capturedImage]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const getPos = (e) => {
    const canvas = signatureCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const ctx = signatureCanvasRef.current.getContext('2d');
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const handlePointerMove = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const ctx = signatureCanvasRef.current.getContext('2d');
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasSigned(true);
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const handleMerge = async () => {
    if (!capturedImage || !signatureCanvasRef.current) return;
    const merged = await mergePhotoAndSignature(capturedImage, signatureCanvasRef.current);
    setMergedResult(merged);
    setMergedImage(merged);
  };

  const getField = (emp, ...keys) => {
    for (const k of keys) if (emp && emp[k] !== undefined) return emp[k];
    return '—';
  };

  if (!employee) {
    return (
      <div className={styles['details-page']}>
        <div className={styles['details-header']}>
          <button className={styles['back-btn']} onClick={() => navigate('/list')}>← Back</button>
          <h1>Employee Not Found</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
          No employee data found. Please go back to the list and select an employee.
        </p>
      </div>
    );
  }

  return (
    <div className={styles['details-page']}>
      <div className={styles['details-header']}>
        <button className={styles['back-btn']} onClick={() => navigate('/list')}>← Back</button>
        <h1>Identity Verification</h1>
      </div>

      {/* Employee Info Card */}
      <div className={styles['info-card']}>
        <div className={styles['info-grid']}>
          <div className={styles['info-item']}>
            <label>Name</label>
            <span>{getField(employee, 'name', 'Name', 'employee_name')}</span>
          </div>
          <div className={styles['info-item']}>
            <label>Email</label>
            <span>{getField(employee, 'email', 'Email', 'employee_email')}</span>
          </div>
          <div className={styles['info-item']}>
            <label>Salary</label>
            <span>₹{parseFloat(getField(employee, 'salary', 'Salary', 'employee_salary') || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className={styles['info-item']}>
            <label>City</label>
            <span>{getField(employee, 'city', 'City')}</span>
          </div>
        </div>
      </div>

      {/* Camera Section */}
      <div className={styles['camera-section']}>
        <h2 className={styles['section-title']}>📷 Capture Profile Photo</h2>

        {!capturedImage && !isStreaming && (
          <div className={styles['camera-placeholder']}>
            <span style={{ fontSize: '3rem' }}>📸</span>
            <p>Click below to start camera</p>
          </div>
        )}

        {isStreaming && (
          <div className={styles['camera-preview']}>
            <video ref={videoRef} autoPlay playsInline muted />
          </div>
        )}

        {cameraError && <p className={styles['camera-error']}>{cameraError}</p>}

        <div className={styles['camera-buttons']}>
          {!capturedImage && !isStreaming && (
            <button className={styles['btn-primary']} onClick={startCamera} id="start-camera-btn">
              Start Camera
            </button>
          )}
          {isStreaming && (
            <button className={styles['btn-primary']} onClick={capture} id="capture-btn">
              📸 Capture
            </button>
          )}
          {capturedImage && !mergedResult && (
            <button className={styles['btn-secondary']} onClick={retake}>
              Retake
            </button>
          )}
        </div>
      </div>

      {/* Signature Section - only show after photo captured */}
      {capturedImage && !mergedResult && (
        <div className={styles['signature-section']}>
          <h2 className={styles['section-title']}>✍️ Sign Over Photo</h2>

          <div className={styles['signature-area']}>
            <img src={capturedImage} alt="Captured" />
            <canvas
              ref={signatureCanvasRef}
              className={styles['signature-canvas']}
              onMouseDown={handlePointerDown}
              onMouseMove={handlePointerMove}
              onMouseUp={handlePointerUp}
              onMouseLeave={handlePointerUp}
              onTouchStart={handlePointerDown}
              onTouchMove={handlePointerMove}
              onTouchEnd={handlePointerUp}
            />
          </div>

          <p className={styles['signature-hint']}>Draw your signature using mouse or touch</p>

          <div className={styles['camera-buttons']}>
            <button className={styles['btn-secondary']} onClick={clearSignature}>
              Clear Signature
            </button>
            <button
              className={styles['btn-primary']}
              onClick={handleMerge}
              disabled={!hasSigned}
              id="merge-btn"
            >
              🔗 Merge Photo & Signature
            </button>
          </div>
        </div>
      )}

      {/* Merged Result */}
      {mergedResult && (
        <div className={styles['merge-section']}>
          <div className={styles['success-badge']}>✅ Verification Complete</div>
          <h2 className={styles['section-title']}>Audit Image</h2>
          <div className={styles['merged-preview']}>
            <img src={mergedResult} alt="Merged Audit" />
          </div>
          <div className={styles['camera-buttons']} style={{ marginTop: '1.5rem' }}>
            <button className={styles['btn-primary']} onClick={() => navigate('/analytics')}>
              📊 View Analytics
            </button>
            <button className={styles['btn-secondary']} onClick={() => {
              setMergedResult(null);
              retake();
            }}>
              Start Over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
