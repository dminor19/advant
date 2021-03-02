import React from 'react';
import Video from '../videos/video.mp4';
import './home.scss';

export const HomePage = () => {
    return (
        <>
            <div className="container">
                <div className="video-container">
                    <video
                        className="home-video"
                        autoPlay
                        loop
                        muted
                        src={Video}
                        type="video/mp4"
                    />
                </div>
                <div className="overlay">
                    <h1 className="logo">Advant</h1>

                    <div className="center-box">
                        <h1>🚧 Currently in Development 🚧</h1>
                        <p>
                            Advant strives to make access to home services
                            equitable and easily accessible through our mobile
                            platform. Customers will be able to schedule home
                            service calls with the best and fastest service.
                            Advant offers amazing opportunities for individuals
                            with home service experience to grow their own
                            business today.
                        </p>
                    </div>

                    <div className="footer">
                        &copy; {new Date().getFullYear()} Advant, all rights
                        reserved
                    </div>
                </div>
            </div>
        </>
    );
};
