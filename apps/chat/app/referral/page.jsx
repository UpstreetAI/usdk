'use client';

import { useEffect } from 'react';


var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

export default function ReferralPage() {

	// Set viral loops Campaign ID:
	const VIRAL_LOOPS_CAMPAIGN_ID = 'Y4Pk0W7J94iNrceLPzfAg0gZjQI';
	
	function loadViralLoops() {
    const SCRIPT_SRC = "https://app.viral-loops.com/widgetsV2/core/loader.js";
    const scriptExists = document.head.querySelector(
      `script[src="${SCRIPT_SRC}"]`
    );
    if (scriptExists) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

	// const getCampaign = (ucid = "default") => __async(void 0, null, function* () {
	// 	if (globalThis.ViralLoops) {
	// 		return yield globalThis.ViralLoops.getCampaign(ucid);
	// 	}
	// 	return new Promise((resolve) => {
	// 		globalThis.addEventListener("vlReady", () => __async(void 0, null, function* () {
	// 			const campaign = yield globalThis.ViralLoops.getCampaign(ucid);
	// 			resolve(campaign);
	// 		}));
	// 	});
	// });

  useEffect(() => {
		// getCampaign(VIRAL_LOOPS_CAMPAIGN_ID)
    loadViralLoops().then(() => {
      const ViralLoops = globalThis["ViralLoops"];
      // console.debug("[VL] -> load ViralLoops script", ViralLoops);
    });
  }, []);

  useEffect(() => {
    // console.debug("[VL] -> set props.ucid", VIRAL_LOOPS_CAMPAIGN_ID);
  }, ["[VL] -> set props.ucid", VIRAL_LOOPS_CAMPAIGN_ID]);

  return (
    <>
			<div className='text-center py-8'>
				<div>Sign up for the Upstreet waitlist!</div>
			</div>
      {VIRAL_LOOPS_CAMPAIGN_ID ? (
        <form-widget ucid={VIRAL_LOOPS_CAMPAIGN_ID} popup={false} />
      ) : null}
    </>
  );
	
}
