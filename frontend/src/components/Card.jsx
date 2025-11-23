import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Card.css';

const Card = ({ title, description, route, previewText, image }) => {
    return (
        <Link to={route} className="card">
            <div className="card-content">
                <div className="card-header">
                    <h3 className="card-title">{title}</h3>
                    <p className="card-description">{description}</p>
                </div>
                <div className="card-preview">
                    {image ? (
                        <img src={image} alt={title} className="card-image" />
                    ) : (
                        <div className="preview-placeholder">
                            {previewText || "Preview"}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default Card;
