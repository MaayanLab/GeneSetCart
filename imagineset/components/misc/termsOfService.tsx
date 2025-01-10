import React from 'react';
import Typography from '@mui/material/Typography';

const TermsOfService: React.FC = () => {
  return (
    <div className="p-4.5 text-sm ml-2">
    <Typography variant="h3" color="secondary.dark" className='p-5'>TERMS OF SERVICE</Typography>
      <Typography variant="h4" color="secondary.dark" className='p-5'>
        Use
      </Typography>
      <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, ml: 2 }}>
        Our gene sorting web-based tools and services are free for academic and non-profit research purposes. For any commercial use, please contact Mount Sinai Innovation Partners (MSIPInfo@mssm.edu) to obtain a license.
      </Typography>

      <Typography variant="h4" color="secondary.dark" className='p-5'>
        Disclaimer
      </Typography>
      <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, ml: 2 }}>
        This site is not intended for treating or diagnosing human subjects.
      </Typography>
      <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, ml: 2 }}>
        The tools, services, and any associated materials or documents provided by this site are made available <strong>as-is</strong> without any warranty of any kind, either express, implied, or statutory. This includes, but is not limited to, implied warranties of merchantability, fitness for a particular purpose, or non-infringement.
      </Typography>
      <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, ml: 2 }}>
        We do not guarantee that the tools or services will be error-free, secure, or free from interruptions. We also cannot make assurances that your use of the tools or documents will not infringe upon the intellectual property or proprietary rights of third parties.
      </Typography>

      <Typography variant="h4" color="secondary.dark" className='p-5'>
        Data Security and Privacy
      </Typography>
      <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, ml: 2 }}>
        While we will never intentionally share any gene sets or data that you store on the site, we cannot guarantee their security. Users are encouraged to avoid uploading sensitive or proprietary information.
      </Typography>
      <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, ml: 2 }}>
        Additionally, if any data is sent to third-party services, including OpenAI, we cannot control how that data is shared, stored, or used by those services. By using this site, you acknowledge and accept this risk.
      </Typography>

      <Typography variant="h4" color="secondary.dark" className='p-5'>
        Liability
      </Typography>
      <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, ml: 2 }}>
        In no event will we or any affiliated entities, including developers, researchers, or institutions, be liable for any damages, including but not limited to direct, indirect, special, or consequential damages, arising out of, resulting from, or in any way connected with the use of this site or associated documents.
      </Typography>

      <Typography variant="h4" color="secondary.dark" className='p-5'>
        Acknowledgment
      </Typography>
      <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, ml: 2 }}>
        By using this site, you acknowledge that you have read, understood, and agree to these terms and conditions.
      </Typography>
    </div>
  );
};

export default TermsOfService;

