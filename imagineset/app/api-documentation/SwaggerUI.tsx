import dynamic from 'next/dynamic';
import React from 'react';
import "swagger-ui-react/swagger-ui.css"


const DynamicSwaggerUI = dynamic(() => import("swagger-ui-react"), {
    ssr: false,
    loading: () => <p>Loading Component...</p>,
  });

function APISwagger() {
    return (
        <div >
            <DynamicSwaggerUI url={process.env.PUBLIC_URL + "/openapi.json"} />
        </div>
    )
}

export default APISwagger;