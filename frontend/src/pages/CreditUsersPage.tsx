import { CreditUserTable } from "@/components/CreditUsers/CreditUserTable";
import Layout from "@/components/Layout/Layout";
import React from "react";

const CreditUsersPage: React.FC = () => {
  return (
    <Layout>
      <h1 className="font-semibold text-2xl">Credit Customers</h1>
      <CreditUserTable />
    </Layout>
  );
};

export default CreditUsersPage;
