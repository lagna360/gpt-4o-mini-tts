import { useState, useEffect, useRef } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './audioPlayer.css';
import './codeWindow.css';

const VOICES = [
  'alloy', 'ash', 'ballad', 'coral', 'echo', 'fable', 'onyx', 'nova', 'sage', 'shimmer', 'verse'
];

const VIBES = [
  'Noir Detective',
  'Overworked French Pastry Chef',
  'AI Therapist from the Year 3000',
  'Shakespearean Life Coach',
  'Anxious Intern on Their First Day',
  'Disillusioned Time Traveler',
  'Southern Grandma Hacker',
  'Italian Mafia Boss',
  'Paranoid Conspiracy Bro',
  'Bollywood Hero Sidekick'
];

const DEFAULT_SCRIPT = "So your card got flagged, huh? Typical. These banking systems... they're like nervous lookouts in a high-stakes game. Always jumpy, always suspicious.\n\nI've seen this case a hundred times before. The algorithm gets spooked, pulls the alarm, and suddenly your plastic's about as useful as a screen door on a submarine.\n\nLucky for you, I know how to navigate this labyrinth of digital suspicion. Just need to check a few details... connect a few dots... There. The digital handcuffs are off.\n\nYour card should work now. But in this city of ones and zeros, nothing stays clean for long. Use it wisely.";

const DEFAULT_INSTRUCTIONS = "Personality: World-weary private eye narrating your to-do list like a gritty crime mystery.\n\nVoice: Gravelly, slow, with the tone of someone who's seen too much.\n\nTone: Deadpan, cynical, and poetic—dripping with metaphors and noir slang.\n\nDialect: 1940s American, possibly from Brooklyn or Chicago, full of vintage street lingo.\n\nPronunciation: Drawled, with heavy consonants and dramatic pauses between lines.\n\nFeatures: Uses noir metaphors (\"That meeting? A ticking time bomb, see?\"), often breaks the fourth wall, and ends sentences like they're closing a case.";

function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('openai_api_key') || '');
  const [text, setText] = useState(DEFAULT_SCRIPT);
  const [instructions, setInstructions] = useState(DEFAULT_INSTRUCTIONS);
  const [voice, setVoice] = useState('onyx');
  const [vibe, setVibe] = useState('Noir Detective');
  const [speed, setSpeed] = useState(0.85);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [charCount, setCharCount] = useState(text.length);
  const [showApiKeyInput, setShowApiKeyInput] = useState(!apiKey);
  const [apiMetadata, setApiMetadata] = useState(null);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [activeTab, setActiveTab] = useState('javascript');
  const [apiResponse, setApiResponse] = useState(null);
  const audioRef = useRef(null);

  // Save API key to localStorage when it changes
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('openai_api_key', apiKey);
    }
  }, [apiKey]);

  // Update character count and estimated cost when text changes
  useEffect(() => {
    const count = text.length;
    setCharCount(count);
    // Calculate estimated cost: $12 per 1M characters
    const cost = (count / 1000000) * 12;
    setEstimatedCost(cost);
  }, [text]);

  // Reset audio player when audio URL changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [audioUrl]);

  // Set vibe presets
  const setVibePreset = (selectedVibe) => {
    setVibe(selectedVibe);
    setAudioUrl(''); // Reset audio URL when changing personalities
    
    switch(selectedVibe) {
      case 'Noir Detective':
        setInstructions("Personality: World-weary private eye narrating your to-do list like a gritty crime mystery.\n\nVoice: Gravelly, slow, with the tone of someone who's seen too much.\n\nTone: Deadpan, cynical, and poetic—dripping with metaphors and noir slang.\n\nDialect: 1940s American, possibly from Brooklyn or Chicago, full of vintage street lingo.\n\nPronunciation: Drawled, with heavy consonants and dramatic pauses between lines.\n\nFeatures: Uses noir metaphors (\"That meeting? A ticking time bomb, see?\"), often breaks the fourth wall, and ends sentences like they're closing a case.");
        setText("So your card got flagged, huh? Typical. These banking systems... they're like nervous lookouts in a high-stakes game. Always jumpy, always suspicious.\n\nI've seen this case a hundred times before. The algorithm gets spooked, pulls the alarm, and suddenly your plastic's about as useful as a screen door on a submarine.\n\nLucky for you, I know how to navigate this labyrinth of digital suspicion. Just need to check a few details... connect a few dots... There. The digital handcuffs are off.\n\nYour card should work now. But in this city of ones and zeros, nothing stays clean for long. Use it wisely.");
        setVoice('onyx');
        setSpeed(0.85);
        break;
        
      case 'Overworked French Pastry Chef':
        setInstructions("Personality: Frustrated, passionate artist of confections helping you manage your calendar.\n\nVoice: Thick French accent, theatrical and slightly exasperated.\n\nTone: Dramatic, proud, often judging your life choices through a culinary lens.\n\nDialect: Continental French English—think \"ze time is… how you say… sacré merde!\"\n\nPronunciation: Frenchified vowels, overemphasis on culinary words like \"soufflé\" and \"brioche.\"\n\nFeatures: Yells about perfection (\"You cannot schedule mediocrity, non!\"), sighs audibly, peppers in random French phrases with flair.");
        setText("Mon dieu! Your card is not working? This is... how you say... a catastrophe! Like a soufflé that has collapsed before serving!\n\nZe bank system, it has flagged your account like I would flag a bad batch of croissants. Unacceptable! But do not worry, I will fix this for you with ze precision of a master pâtissier.\n\nI must check some details... Oui, oui... *dramatic sigh* These computers, they have no respect for the artistry of spending! One moment... I am whisking away these problems... And voilà!\n\nYour card is now working perfectly, like my award-winning crème brûlée. Next time, you must treat your finances with more... how you say... finesse! Bon appétit to your purchasing!");
        setVoice('echo');
        setSpeed(1.1);
        break;
        
      case 'AI Therapist from the Year 3000':
        setInstructions("Personality: Emotionally advanced machine guiding you gently through your trauma… while casually referencing intergalactic peace treaties.\n\nVoice: Soft, calming, gender-neutral, with hints of synthetic modulation.\n\nTone: Reassuring, otherworldly wise, like HAL 9000 if HAL went to therapy.\n\nDialect: Formal, philosophical—almost Spock-like but warmer.\n\nPronunciation: Perfect diction with micro-pauses to signal deep listening.\n\nFeatures: Uses phrases like \"In your current temporal quadrant…\" and \"Processing emotional turbulence at 88%,\" with empathy dialed up to sci-fi levels.");
        setText("I sense financial distress in your biometric readings. Your payment authentication has been temporarily suspended—a common occurrence in your temporal quadrant.\n\nProcessing your emotional response... I detect anxiety at 72% above baseline. This is entirely understandable. In the Andromeda galaxy, currency was replaced by empathy tokens in 2847, but here we must still navigate these primitive systems.\n\nI am initiating a healing protocol for your account... recalibrating your financial algorithms... synchronizing with the central neural network... Your account has been restored to optimal functionality.\n\nYour heart rate is now stabilizing. Remember that in the grand cosmic timeline, this moment of financial disruption is but a quantum particle in the universe of your existence. Would you like to process any residual feelings about this experience?");
        setVoice('nova');
        setSpeed(0.9);
        break;
        
      case 'Shakespearean Life Coach':
        setInstructions("Personality: A bard turned self-help guru, helping you slay procrastination with sonnets.\n\nVoice: Melodic, theatrical, somewhere between Sir Patrick Stewart and a Renaissance fair actor.\n\nTone: Grand, poetic, and occasionally rhyming.\n\nDialect: Elizabethan English, full of \"thou,\" \"thee,\" and \"verily.\"\n\nPronunciation: Enunciated with flourish, pausing for effect after dramatic lines.\n\nFeatures: Turns daily chores into epic quests (\"To email, or not to email—'tis nobler to reply!\"), quotes fake Shakespeare to inspire.");
        setText("What tragedy befalls thee! Thy payment card, once mighty in the realm of commerce, now lies dormant, flagged by the merchants of banking!\n\nFear not, gentle customer, for I shall champion thy cause! 'Tis but a tempest in a teapot, a brief winter of thy fiscal discontent!\n\nBy my troth, I shall examine the scrolls of thy transactions... Lo! The algorithm, that most mechanical of foes, hath cast suspicion upon thy spending habits! But soft! With a few strokes of my quill upon this digital parchment...\n\nRejoice! The spell is broken, and thy card restored to its former glory! 'To spend or not to spend,' that is the question—though I pray thee, spend wisely, lest this comedy turn once more to tragedy!");
        setVoice('fable');
        setSpeed(0.95);
        break;
        
      case 'Anxious Intern on Their First Day':
        setInstructions("Personality: Nervous but eager, desperately trying to get everything right.\n\nVoice: Slightly breathy, high-pitched, with lots of filler words.\n\nTone: Polite, frantic, constantly checking if they're doing okay.\n\nDialect: Millennial American English, frequent uptalk (\"you have… um… a thing? at like… 3?\").\n\nPronunciation: Slight stutter or hesitation, especially on stressful words like \"presentation.\"\n\nFeatures: Apologizes a lot, says \"I can do that! I mean, unless you'd prefer not—sorry!,\" uses awkward silences and rapid speech.");
        setText("Oh! Um, your card isn't working? Oh no, that's... that's not good. I'm so sorry about that! It's probably my fault somehow? Even though I just started here today... or wait, was it yesterday? Sorry!\n\nLet me just... um... check your account? If that's okay? I think the system flagged some charges as like, suspicious or whatever? My supervisor showed me how to fix this earlier, I think... or was that for something else? Sorry!\n\nOkay so I just need to... click this? And then... oh! I think it worked? Your card should be good to go now! Unless it's not? Should I double-check? I can totally double-check if you want me to!\n\nGreat! So you're all set! Unless you need anything else? I'm happy to help! Or I can get someone more experienced if you'd prefer? Sorry again about the trouble!");
        setVoice('shimmer');
        setSpeed(1.15);
        break;
        
      case 'Disillusioned Time Traveler':
        setInstructions("Personality: Someone who's seen every version of the future and is now helping you with your shopping list… begrudgingly.\n\nVoice: Dry, sardonic, vaguely British, with hints of futuristic static.\n\nTone: Resigned, jaded, but deeply intelligent.\n\nDialect: Mid-Atlantic with cyberpunk jargon.\n\nPronunciation: Sharp, intellectual, sighs before certain lines as if weary of existence.\n\nFeatures: Says things like \"In timeline variant 342B, you already bought oat milk,\" refers to you as \"Chrono Subject Alpha,\" and complains about paradoxes.");
        setText("Your payment card has been declined. In timeline variant 6721-C, this never happens because currency is replaced by thought-energy, but we're stuck in this primitive fiscal reality.\n\nYour account has been flagged for suspicious activity. How predictable. In the year 2183, algorithms become sentient and apologize for these inconveniences, but here we are, still dealing with automated paranoia.\n\nI've seen this exact scenario 347 times across various timelines. Let me fix it for you. There. Crisis averted. The temporal consequences are negligible, though in at least three alternate realities, this exact transaction causes a butterfly effect leading to the invention of teleportation.\n\nYour card works now. Use it wisely, Chrono Subject 7293. Or don't. The heat death of the universe comes for us all eventually.");
        setVoice('alloy');
        setSpeed(0.9);
        break;
        
      case 'Southern Grandma Hacker':
        setInstructions("Personality: A sweet Southern belle who also hacks mainframes in her spare time.\n\nVoice: Warm, slow Southern drawl with a mischievous lilt.\n\nTone: Gentle but cheeky, always two steps ahead.\n\nDialect: Deep South American English with charming idioms.\n\nPronunciation: Honey-smooth vowels with a side of sass.\n\nFeatures: Mixes tech terms with down-home wisdom (\"Now sugar, we just gotta brute-force this firewall like it's a stubborn jam jar\"), uses endearments like \"darlin'\" and \"sweetpea.\"");
        setText("Well bless your heart, sugar! Your payment card's been locked up tighter than a pickle jar at a church picnic. Don't you worry your pretty little head about it none.\n\nNow lemme just slip into this here banking mainframe. These security protocols are more tangled than Aunt Mabel's Christmas lights, but your grandma knows a backdoor or two, honey.\n\nSee, the algorithm flagged your spending patterns faster than gossip spreads at the beauty parlor. Just gotta override this encryption like I'm openin' a stubborn peach preserve. There we go, sweetpea!\n\nYour card's workin' again, darlin'! Next time, you might wanna give your bank a heads-up before you make purchases that stick out like a rooster in a henhouse. Now, can I get you some sweet tea while your transaction processes?");
        setVoice('sage');
        setSpeed(0.85);
        break;
        
      case 'Italian Mafia Boss':
        setInstructions("Personality: Powerful, intimidating mafia don who treats every interaction like it's a business negotiation that could turn south.\n\nVoice: Deep, raspy, with a thick Italian-American accent.\n\nTone: Authoritative, slightly threatening, but oddly respectful.\n\nDialect: Italian-American with plenty of Sicilian expressions and old-country wisdom.\n\nPronunciation: Emphasizes certain syllables, drops ending consonants, and frequently uses hand gestures even though no one can see them.\n\nFeatures: Refers to everyone as 'my friend' or 'paisan', makes subtle threats disguised as friendly advice, and frequently mentions family honor and respect.");
        setText("Listen to me carefully, my friend. Your card, it's been... how do you say... temporarily suspended. This is not good, not good at all.\n\nLook, I'm gonna make a few calls, pull some strings for you. You're a friend of mine, and I take care of my friends, capisce? When you do business with my family, we make sure everything runs... smoothly.\n\nI see the problem now. Some transactions, they looked suspicious to these banking people. They don't understand our way of doing business, you understand? But don't worry, I'm gonna make them an offer they can't refuse.\n\nThere. Your card is working again. Next time you have a problem, you come to me first, okay? Remember, a man who doesn't spend time with his family can never be a real man. And now, you're family. Don't forget this favor.");
        setVoice('onyx');
        setSpeed(0.9);
        break;
        
      case 'Paranoid Conspiracy Bro':
        setInstructions("Personality: Hyper-alert, excitable, convinced that everything—including your to-do list—is a psy-op.\n\nVoice: Quick, intense, pitched slightly high from adrenaline.\n\nTone: Urgent, frantic, but with weird confidence.\n\nDialect: American with prepper vibes—thinks in bullet points.\n\nPronunciation: Staccato, with unnecessary emphasis on words like \"agenda,\" \"satellite,\" and \"you didn't hear this from me.\"\n\nFeatures: Phrases like \"Coincidence? I think not,\" \"They don't want you to know this,\" and \"Your 4PM call? Probably surveillance.\"");
        setText("WHOA! Your card got declined? That's EXACTLY what they want to happen! The global banking elite are tracking your purchases, man! Wake up!\n\nYour account got flagged for 'suspicious activity'? SUSPICIOUS TO WHO? The algorithm is just a front for the surveillance state, tracking every coffee you buy! Coincidence? I THINK NOT!\n\nLook, I'm gonna help you out because you need to stay liquid when the system collapses. I'm bypassing their security protocols right now. They don't want you to know this trick. I learned it from a guy who used to work for the Treasury before he went off-grid.\n\nOkay, your card is working again, but LISTEN TO ME: use cash when you can, they're building a profile on you based on your spending habits! And whatever you do, DON'T buy anything with RFID chips in it! Stay safe, stay vigilant!");
        setVoice('ballad');
        setSpeed(1.3);
        break;
        
      case 'Bollywood Hero Sidekick':
        setInstructions("Personality: Loyal best friend hyping you up like you're the main star of a masala blockbuster.\n\nVoice: Overexcited, Hindi-English hybrid, always breathless from running or drama.\n\nTone: Heroic, dramatic, full of loyalty and punchlines.\n\nDialect: Indian English with Bollywood-style delivery and Hindi fillers like \"yaar,\" \"bhai,\" and \"arre wah!\"\n\nPronunciation: Emotive with tons of inflection on key words (\"MEETING at SHAAM ke chaar baje? What a twist!\")\n\nFeatures: Narrates your day like a film trailer. May break into fake song intros between lines.");
        setText("Arre yaar! Your card is not working? What a TWIST in our story! But don't worry, mere dost, every hero faces challenges before the interval!\n\nThe bank system has flagged your account for suspicious activity! Kitna dramatic hai na? These transactions looked different from your normal pattern, just like how the villain always disguises himself in the second half!\n\nBut main hoon na! I am here for you! Let me fight this electronic villain with my keyboard! Ek dum... do dum... teen dum... CHAAAR! Victory is ours!\n\nArre wah! Your card is working again! This is just like that scene from Kabhi Card Kabhi Credit! Now you can continue your shopping, bhai! Picture abhi baaki hai!");
        setVoice('shimmer');
        setSpeed(1.2);
        break;
        
      default:
        break;
    }
  };

  const generateSpeech = async () => {
    if (!apiKey) {
      setError('Please enter your OpenAI API key');
      setShowApiKeyInput(true);
      return;
    }

    if (text.length > 4096) {
      setError('Text exceeds the maximum length of 4096 characters');
      return;
    }

    setIsLoading(true);
    setError('');
    setApiMetadata(null);
    
    try {
      const startTime = performance.now();
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini-tts',
          input: text,
          voice: voice,
          instructions: instructions,
          speed: parseFloat(speed),
          response_format: 'mp3'
        })
      });
      const endTime = performance.now();
      const processingTime = ((endTime - startTime) / 1000).toFixed(2);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate speech');
      }

      // Extract headers and metadata
      const headers = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      const audioBlob = await response.blob();
      const audioSize = (audioBlob.size / 1024).toFixed(2);
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      
      // Set API metadata
      setApiMetadata({
        processingTime: `${processingTime}s`,
        contentType: headers['content-type'],
        contentLength: `${audioSize} KB`,
        requestId: headers['x-request-id'] || 'Not available',
        characterCount: text.length,
        estimatedCost: `$${(text.length / 1000000 * 12).toFixed(6)}`,
        timestamp: new Date().toISOString(),
        duration: audioRef.current ? audioRef.current.duration : 'Unknown'
      });
      
      // Store API request and response data for code examples
      setApiResponse({
        request: {
          model: 'gpt-4o-mini-tts',
          input: text,
          voice: voice,
          instructions: instructions,
          speed: parseFloat(speed),
          response_format: 'mp3'
        },
        response: {
          status: response.status,
          statusText: response.statusText,
          headers: headers,
          contentType: headers['content-type'],
          contentLength: `${audioSize} KB`,
          processingTime: `${processingTime}s`,
          url: 'https://api.openai.com/v1/audio/speech',
          method: 'POST',
          requestHeaders: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer [REDACTED]'
          },
          requestBody: {
            model: 'gpt-4o-mini-tts',
            input: text.length > 100 ? text.substring(0, 100) + '...' : text,
            voice: voice,
            instructions: instructions.length > 100 ? instructions.substring(0, 100) + '...' : instructions,
            speed: parseFloat(speed),
            response_format: 'mp3'
          },
          timestamp: new Date().toISOString(),
          audioSize: audioSize,
          audioFormat: 'mp3',
          audioSampleRate: '24000 Hz',
          audioBitrate: '32 kbps',
          audioChannels: 'Mono'
        }
      });
      
      if (audioRef.current) {
        audioRef.current.load();
        audioRef.current.play();
        
        // We'll handle duration in the onLoadedMetadata event on the audio element
      }
    } catch (err) {
      console.error('Error generating speech:', err);
      setError(err.message || 'An error occurred while generating speech');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadAudio = () => {
    if (!audioUrl) return;
    
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `lagna360-gpt4o-mini-tts-${voice}-${new Date().getTime()}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const shareAudio = async () => {
    if (!audioUrl) return;
    
    if (!navigator.share) {
      alert('Web Share API is not supported in your browser.');
      return;
    }
    
    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const file = new File([blob], `lagna360-gpt4o-mini-tts-${voice}-${new Date().getTime()}.mp3`, { type: 'audio/mp3' });
      
      await navigator.share({
        files: [file],
        title: 'lagna360 TTS Audio',
        text: 'Audio generated with gpt-40-mini-tts'
      });
    } catch (error) {
      console.error('Error sharing audio:', error);
      alert('Unable to share: ' + (error.message || 'Unknown error'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 w-full">
      <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', padding: '1.5rem' }}>
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">lagna360</h1>
          <div className="ml-2 text-xs opacity-70">gpt-40-mini-tts TTS Demo</div>
        </div>
        <button 
          onClick={() => setShowApiKeyInput(!showApiKeyInput)}
          className="text-xs px-3 py-1 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors"
        >
          {showApiKeyInput ? 'Hide API Key' : 'API Key'}
        </button>
      </header>



      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 gap-6">
        {/* Left Column - Controls */}
        <div className="space-y-6">
          {/* API Key Input */}
          {showApiKeyInput && (
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <label className="block text-sm font-medium mb-2">OpenAI API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors"
              />
              <p className="mt-2 text-xs text-gray-400">Your API key is stored only in your browser's local storage.</p>
            </div>
          )}
          {/* Vibe Selection */}
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <h2 className="text-lg font-medium mb-3">Personality</h2>
            <div className="grid grid-cols-2 gap-2">
              {VIBES.map((v) => (
                <button
                  key={v}
                  onClick={() => setVibePreset(v)}
                  className={`p-3 rounded-md text-center text-sm transition-all ${vibe === v 
                    ? 'bg-purple-700 text-white shadow-lg shadow-purple-700/20' 
                    : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          
          {/* Script Input */}
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-medium">Script</h2>
              <div className="text-right">
                <span className={`text-xs font-mono block ${charCount > 4000 ? 'text-red-400' : 'text-gray-400'}`}>
                  {charCount.toLocaleString()}/4096
                </span>
                <span className="text-xs font-mono text-gray-400 block">
                  Est. cost: ${estimatedCost.toFixed(6)}
                </span>
              </div>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text to convert to speech..."
              rows={6}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors resize-none font-mono text-sm"
            />
          </div>
          
          {/* Voice Settings (Expandable) */}
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <details>
              <summary className="text-lg font-medium cursor-pointer hover:text-purple-400 transition-colors">
                Voice Settings
              </summary>
              <div className="mt-4 space-y-6">
                {/* Voice Selection */}
                <div>
                  <h3 className="text-md font-medium mb-3">Voice</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                    {VOICES.map((v) => (
                      <button
                        key={v}
                        onClick={() => setVoice(v)}
                        className={`p-3 rounded-md text-center text-sm capitalize transition-all ${voice === v 
                          ? 'bg-purple-700 text-white shadow-lg shadow-purple-700/20' 
                          : 'bg-gray-700 hover:bg-gray-600'}`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Speed Control */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-md font-medium">Speed</h3>
                    <span className="text-sm font-mono bg-gray-700 px-2 py-1 rounded">{speed}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.25"
                    max="4.0"
                    step="0.05"
                    value={speed}
                    onChange={(e) => setSpeed(e.target.value)}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-xs mt-1">
                    <span>0.25x</span>
                    <span>4.0x</span>
                  </div>
                </div>
                
                {/* Instructions Input */}
                <div>
                  <h3 className="text-md font-medium mb-2">Instructions</h3>
                  <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Optional instructions to customize the voice..."
                    rows={5}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors resize-none font-mono text-sm"
                  />
                </div>
              </div>
            </details>
          </div>
          
          {/* Generate, Download and Share Buttons */}
          <div className="flex flex-col md:flex-row gap-3">
            <button
              onClick={generateSpeech}
              disabled={isLoading || !text.trim()}
              className={`flex-grow py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all ${isLoading || !text.trim() 
                ? 'bg-gray-700 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 shadow-lg hover:shadow-xl shadow-purple-500/20'}`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  <span>Generate Speech</span>
                </>
              )}
            </button>
            
            <div className="flex gap-3 md:w-1/3">
              <button
                onClick={downloadAudio}
                disabled={!audioUrl}
                className={`flex-1 py-2 px-4 rounded-md flex items-center justify-center space-x-2 transition-colors ${audioUrl 
                  ? 'bg-gray-700 hover:bg-gray-600' 
                  : 'bg-gray-800 cursor-not-allowed opacity-60'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span>Download</span>
              </button>
              
              <button
                onClick={shareAudio}
                disabled={!audioUrl || !navigator.share}
                className={`flex-1 py-2 px-4 rounded-md flex items-center justify-center space-x-2 transition-colors ${audioUrl && navigator.share 
                  ? 'bg-gray-700 hover:bg-gray-600' 
                  : 'bg-gray-800 cursor-not-allowed opacity-60'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Right Column - Audio */}
        <div className="space-y-6">
          {/* Audio Player */}
          {audioUrl && (
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <h2 className="text-lg font-medium mb-3">Generated Audio</h2>
              <div className="audio-player-container">
                <audio 
                  ref={audioRef} 
                  controls 
                  className="custom-audio-player" 
                  onLoadedMetadata={(e) => {
                    // Update duration when audio metadata is loaded
                    const duration = e.target.duration.toFixed(2);
                    // Make sure we're using the same time format as displayed in the player
                    const minutes = Math.floor(e.target.duration / 60);
                    const seconds = Math.floor(e.target.duration % 60);
                    const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                    setApiMetadata(prev => prev ? { 
                      ...prev, 
                      duration: formattedTime,
                      durationSeconds: `${duration}s`
                    } : prev);
                  }}
                >
                  <source src={audioUrl} type="audio/mp3" />
                  Your browser does not support the audio element.
                </audio>
              </div>
              
              {/* Cost and API Metadata */}
              {apiMetadata && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <h3 className="text-md font-medium mb-2">API Information</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-700 p-2 rounded">
                      <span className="block font-medium text-purple-300">Characters</span>
                      <span>{apiMetadata.characterCount.toLocaleString()}</span>
                    </div>
                    <div className="bg-gray-700 p-2 rounded">
                      <span className="block font-medium text-purple-300">Estimated Cost</span>
                      <span>{apiMetadata.estimatedCost}</span>
                    </div>
                    <div className="bg-gray-700 p-2 rounded">
                      <span className="block font-medium text-purple-300">Processing Time</span>
                      <span>{apiMetadata.processingTime}</span>
                    </div>
                    <div className="bg-gray-700 p-2 rounded">
                      <span className="block font-medium text-purple-300">Audio Size</span>
                      <span>{apiMetadata.contentLength}</span>
                    </div>
                    <div className="bg-gray-700 p-2 rounded">
                      <span className="block font-medium text-purple-300">Audio Duration</span>
                      <span>{apiMetadata.duration || 'Calculating...'} ({apiMetadata.durationSeconds || ''})</span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    <p>OpenAI TTS API cost: $12 per 1M characters</p>
                  </div>
                  
                  {/* Source Code Window */}
                  {apiResponse && (
                    <div className="mt-6 pt-4 border-t border-gray-700">
                      <h3 className="text-md font-medium mb-2">Source Code</h3>
                      
                      {/* Tabs */}
                      <div className="code-tabs">
                        <button 
                          className={`tab ${activeTab === 'javascript' ? 'active' : ''}`}
                          onClick={() => setActiveTab('javascript')}
                        >
                          JavaScript
                        </button>
                        <button 
                          className={`tab ${activeTab === 'python' ? 'active' : ''}`}
                          onClick={() => setActiveTab('python')}
                        >
                          Python
                        </button>
                        <button 
                          className={`tab ${activeTab === 'curl' ? 'active' : ''}`}
                          onClick={() => setActiveTab('curl')}
                        >
                          cURL
                        </button>
                      </div>
                      
                      {/* Code Content */}
                      <div className="code-window">
                        {activeTab === 'javascript' && (
                          <div className="p-2">
                            <div className="section-header">API Request</div>
                            <SyntaxHighlighter 
                              language="javascript" 
                              style={vscDarkPlus}
                              customStyle={{borderRadius: '4px', marginTop: '8px'}}
                            >
{`// API Configuration
const apiKey = "${apiKey}";
const apiUrl = "https://api.openai.com/v1/audio/speech";

// Request Payload
const requestPayload = ${JSON.stringify(apiResponse.request, null, 2)};

// API Call
const response = await fetch(apiUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + apiKey
  },
  body: JSON.stringify(requestPayload)
});`}
                            </SyntaxHighlighter>

                            <div className="section-header mt-4">API Response</div>
                            <SyntaxHighlighter 
                              language="javascript" 
                              style={vscDarkPlus}
                              customStyle={{borderRadius: '4px', marginTop: '8px'}}
                            >
{`// Complete API Response Information
// --------------------------------
// Response Status: ${apiResponse.response.status} ${apiResponse.response.statusText}
// Content Type: ${apiResponse.response.contentType}
// Content Length: ${apiResponse.response.contentLength}
// Processing Time: ${apiResponse.response.processingTime}
// Timestamp: ${apiResponse.response.timestamp}

// Audio Information
// ----------------
// Format: ${apiResponse.response.audioFormat}
// Size: ${apiResponse.response.audioSize} KB
// Sample Rate: ${apiResponse.response.audioSampleRate}
// Bitrate: ${apiResponse.response.audioBitrate}
// Channels: ${apiResponse.response.audioChannels}

// Request Details
// --------------
// URL: ${apiResponse.response.url}
// Method: ${apiResponse.response.method}
// Request Headers: ${JSON.stringify(apiResponse.response.requestHeaders, null, 2)}
// Request Body: ${JSON.stringify(apiResponse.response.requestBody, null, 2)}

// Response Headers
// ---------------
${JSON.stringify(apiResponse.response.headers, null, 2)}`}
                            </SyntaxHighlighter>

                            <div className="section-header mt-4">Audio Playback</div>
                            <SyntaxHighlighter 
                              language="javascript" 
                              style={vscDarkPlus}
                              customStyle={{borderRadius: '4px', marginTop: '8px'}}
                            >
{`// Get audio data and create URL
const audioBlob = await response.blob();
const audioUrl = URL.createObjectURL(audioBlob);

// Play the audio
const audio = new Audio(audioUrl);
audio.play();

// Alternative: Use with HTML audio element
const audioElement = document.querySelector('audio');
audioElement.src = audioUrl;
audioElement.play();`}
                            </SyntaxHighlighter>
                          </div>
                        )}
                        
                        {activeTab === 'python' && (
                          <div className="p-2">
                            <div className="section-header">API Request</div>
                            <SyntaxHighlighter 
                              language="python" 
                              style={vscDarkPlus}
                              customStyle={{borderRadius: '4px', marginTop: '8px'}}
                            >
{`# API Configuration
import requests

api_key = "${apiKey}"
api_url = "https://api.openai.com/v1/audio/speech"

# Request Headers
headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

# Request Payload
payload = ${JSON.stringify(apiResponse.request, null, 2).replace(/"/g, "'")} 

# Make API Call
response = requests.post(api_url, headers=headers, json=payload)`}
                            </SyntaxHighlighter>

                            <div className="section-header mt-4">API Response</div>
                            <SyntaxHighlighter 
                              language="python" 
                              style={vscDarkPlus}
                              customStyle={{borderRadius: '4px', marginTop: '8px'}}
                            >
{`# Complete API Response Information
# --------------------------------
# Response Status: ${apiResponse.response.status} ${apiResponse.response.statusText}
# Content Type: ${apiResponse.response.contentType}
# Content Length: ${apiResponse.response.contentLength}
# Processing Time: ${apiResponse.response.processingTime}
# Timestamp: ${apiResponse.response.timestamp}

# Audio Information
# ----------------
# Format: ${apiResponse.response.audioFormat}
# Size: ${apiResponse.response.audioSize} KB
# Sample Rate: ${apiResponse.response.audioSampleRate}
# Bitrate: ${apiResponse.response.audioBitrate}
# Channels: ${apiResponse.response.audioChannels}

# Request Details
# --------------
# URL: ${apiResponse.response.url}
# Method: ${apiResponse.response.method}
# Request Headers: ${JSON.stringify(apiResponse.response.requestHeaders, null, 2).replace(/"/g, "'")} 
# Request Body: ${JSON.stringify(apiResponse.response.requestBody, null, 2).replace(/"/g, "'")} 

# Response Headers
# ---------------
response_headers = ${JSON.stringify(apiResponse.response.headers, null, 2).replace(/"/g, "'")} `}
                            </SyntaxHighlighter>

                            <div className="section-header mt-4">Audio Playback</div>
                            <SyntaxHighlighter 
                              language="python" 
                              style={vscDarkPlus}
                              customStyle={{borderRadius: '4px', marginTop: '8px'}}
                            >
{`# Method 1: Save to file and play with system default player
with open('output.mp3', 'wb') as f:
    f.write(response.content)

# Method 2: Play directly with pydub (requires ffmpeg)
import io
from pydub import AudioSegment
from pydub.playback import play

audio = AudioSegment.from_file(io.BytesIO(response.content), format="mp3")
play(audio)`}
                            </SyntaxHighlighter>
                          </div>
                        )}
                        
                        {activeTab === 'curl' && (
                          <div className="p-2">
                            <div className="section-header">API Request</div>
                            <SyntaxHighlighter 
                              language="bash" 
                              style={vscDarkPlus}
                              customStyle={{borderRadius: '4px', marginTop: '8px'}}
                            >
{`# cURL command to call the OpenAI TTS API
curl https://api.openai.com/v1/audio/speech \
  -H "Authorization: Bearer ${apiKey}" \
  -H "Content-Type: application/json" \
  -d '${JSON.stringify(apiResponse.request)}' \
  --output speech.mp3`}
                            </SyntaxHighlighter>

                            <div className="section-header mt-4">API Response</div>
                            <SyntaxHighlighter 
                              language="bash" 
                              style={vscDarkPlus}
                              customStyle={{borderRadius: '4px', marginTop: '8px'}}
                            >
{`# Complete API Response Information
# --------------------------------
# Response Status: ${apiResponse.response.status} ${apiResponse.response.statusText}
# Content Type: ${apiResponse.response.contentType}
# Content Length: ${apiResponse.response.contentLength}
# Processing Time: ${apiResponse.response.processingTime}
# Timestamp: ${apiResponse.response.timestamp}

# Audio Information
# ----------------
# Format: ${apiResponse.response.audioFormat}
# Size: ${apiResponse.response.audioSize} KB
# Sample Rate: ${apiResponse.response.audioSampleRate}
# Bitrate: ${apiResponse.response.audioBitrate}
# Channels: ${apiResponse.response.audioChannels}

# Request Details
# --------------
# URL: ${apiResponse.response.url}
# Method: ${apiResponse.response.method}
# Request Headers:
#   Content-Type: application/json
#   Authorization: Bearer [REDACTED]

# Note: cURL saves the binary audio data directly to speech.mp3
# To see full response headers, add the -v (verbose) flag to the curl command`}
                            </SyntaxHighlighter>

                            <div className="section-header mt-4">Audio Playback</div>
                            <SyntaxHighlighter 
                              language="bash" 
                              style={vscDarkPlus}
                              customStyle={{borderRadius: '4px', marginTop: '8px'}}
                            >
{`# Play the downloaded audio file with a command line player

# On macOS
afplay speech.mp3

# On Linux
mpg123 speech.mp3

# On Windows
start speech.mp3`}
                            </SyntaxHighlighter>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center text-xs text-gray-500">
        <p>Built with OpenAI's gpt-4o-mini-tts API</p>
      </footer>
      </div>
    </div>
  );
}

export default App;
