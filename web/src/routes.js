import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { LoginView } from './modules/user/LoginView';
import { MeView } from './modules/user/MeView';
import { RegisterView } from './modules/user/RegisterView';
import { HomeView } from './modules/HomeView';

export const Routes = () => {
    return (
        <BrowserRouter>
            <Switch>
                <Route exact path="/" component={HomeView} />
                <Route path="/login" component={LoginView} />
                <Route path="/register" component={RegisterView} />
                <Route path="/me" component={MeView} />
            </Switch>
        </BrowserRouter>
    );
};
