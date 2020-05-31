// Single Provider That Can Be Imported

import React from "react";

import AnalyticsProvider from "./analytics/analytics.provider";
import ShelfProvider from "./api/shelf/shelf.provider";
import UserProvider from "./user/user.provider";

const RootProvider = ({ children }) => {
  return (
    <UserProvider>
      <AnalyticsProvider>
        <ShelfProvider>{children}</ShelfProvider>
      </AnalyticsProvider>
    </UserProvider>
  );
};

export default RootProvider;