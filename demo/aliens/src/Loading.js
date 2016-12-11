import { h } from '../../../worker.js';

export default function() {
  return (
    <div class="loading">
      <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24px" height="30px" viewBox="0 0 24 30" style="enable-background:new 0 0 50 50;" >
        <rect x="0" y="0" width="4" height="10" fill="#333" transform="translate(0 17.7778)">
          <animateTransform attributeType="xml" attributeName="transform" type="translate" values="0 0; 0 20; 0 0" begin="0" dur="0.6s" repeatCount="indefinite"></animateTransform>
        </rect>
        <rect x="10" y="0" width="4" height="10" fill="#333" transform="translate(0 4.44444)">
          <animateTransform attributeType="xml" attributeName="transform" type="translate" values="0 0; 0 20; 0 0" begin="0.2s" dur="0.6s" repeatCount="indefinite"></animateTransform>
        </rect>
        <rect x="20" y="0" width="4" height="10" fill="#333" transform="translate(0 8.88889)">
          <animateTransform attributeType="xml" attributeName="transform" type="translate" values="0 0; 0 20; 0 0" begin="0.4s" dur="0.6s" repeatCount="indefinite"></animateTransform>
        </rect>
      </svg>
    </div>
  );
};
