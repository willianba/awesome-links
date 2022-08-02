import "../styles/tailwind.css";
import React from "react";
import Layout from "../components/Layout";
import { ApolloProvider } from "@apollo/client";
import apolloClient from "../lib/apollo";
import { UserProvider } from "@auth0/nextjs-auth0";

function MyApp({ Component, pageProps }) {
  return (
    <UserProvider>
      <ApolloProvider client={apolloClient}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ApolloProvider>
    </UserProvider>
  );
}

export default MyApp;
