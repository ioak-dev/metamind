import React, { useEffect, useState } from 'react';

import { Route, Routes } from 'react-router-dom';
import './RouterView.scss';
import Home from '../Home';
import { loginPageSubject } from '../../events/LoginPageEvent';
import ProtectedRouteApp from '../ProtectedRouteApp';
import LandingPage from '../Page/LandingPage';
import OaLogin from '../Auth/OaLogin';
import EditCompanyPage from '../Page/EditCompanyPage';
import UnauthorizedPage from '../Page/UnauthorizedPage';
import ExpensePage from '../Page/ExpensePage';
import EditCompany from '../Page/SettingsPage/EditCompany';
import Permissions from '../Page/SettingsPage/Permissions';
import BackupAndRestore from '../Page/SettingsPage/BackupAndRestore';
import GraphPage from '../Page/GraphPage';
import NotePage from '../Page/NotePage';
import MetadataDefinitionPage from '../Page/MetadataDefinitionPage';
import BrowsePage from '../Page/BrowsePage';

interface Props {
}

const RouterView = (props: Props) => {
  const [loginPage, setLoginPage] = useState(true);

  useEffect(() => {
    loginPageSubject.subscribe((message) => {
      setLoginPage(message.state);
    });
  }, []);

  return (
    <div
      className={`router-view ${loginPage ? 'login-page' : 'not-login-page'}`}
    >
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRouteApp
              middleware={['authenticate']} component={LandingPage} />
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRouteApp
              middleware={['authenticate']} component={LandingPage} />
          }
        />
        <Route
          path="/login"
          element={
            <ProtectedRouteApp
              middleware={[]} component={OaLogin} />}
        />
        <Route
          path="/company/edit"
          element={
            <ProtectedRouteApp
              middleware={['authenticate']} component={EditCompanyPage} />}
        />
        <Route
          path="/:space/unauthorized"
          element={
            <ProtectedRouteApp
              middleware={['isAuthenticated']} component={UnauthorizedPage} />}
        />
        <Route
          path="/:space/home"
          element={
            <ProtectedRouteApp
              middleware={['readAuthentication']} component={ExpensePage} />}
        />
        <Route
          path="/:space/note/:id"
          element={
            <ProtectedRouteApp
              middleware={['readAuthentication']} component={NotePage} />}
        />
        <Route
          path="/:space/browse"
          element={
            <ProtectedRouteApp
              middleware={['readAuthentication']} component={BrowsePage} />}
        />
        <Route
          path="/:space/graph"
          element={
            <ProtectedRouteApp
              middleware={['readAuthentication']} component={GraphPage} />}
        />
        <Route
          path="/:space/metadata-definition"
          element={
            <ProtectedRouteApp
              middleware={['readAuthentication']} component={MetadataDefinitionPage} />}
        />
        <Route
          path="/:space/settings/company"
          element={
            <ProtectedRouteApp
              middleware={['authenticate']} component={EditCompany} />}
        />
        <Route
          path="/:space/settings/user"
          element={
            <ProtectedRouteApp
              middleware={['authenticate']} component={Permissions} />}
        />
        <Route
          path="/:space/settings/backup"
          element={
            <ProtectedRouteApp
              middleware={['authenticate']} component={BackupAndRestore} />}
        />
      </Routes>
    </div>
  );
};

export default RouterView;
