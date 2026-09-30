import React, { useState } from 'react';
import { Database, ShieldAlert, Copy, Check, ExternalLink, Key, RefreshCw } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { saveCustomFirebaseConfig, type FirebaseConfigOptions } from '../../firebase/config';

interface FirebaseConfigPromptProps {
  onDismiss?: () => void;
}

export const FirebaseConfigPrompt: React.FC<FirebaseConfigPromptProps> = () => {
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [rawSnippet, setRawSnippet] = useState('');
  const [parseSuccess, setParseSuccess] = useState(false);

  const [formConfig, setFormConfig] = useState<FirebaseConfigOptions>({
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
  });

  const envExampleText = `VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
# Storage is optional on Spark plan (CRM uses direct Image URLs):
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef`;

  const copyEnvToClipboard = () => {
    navigator.clipboard.writeText(envExampleText);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2500);
  };

  const handleSnippetPaste = (text: string) => {
    setRawSnippet(text);
    setParseSuccess(false);

    const extract = (keys: string[]): string => {
      for (const key of keys) {
        // Matches JS config: apiKey: "...", apiKey: '...'
        // Matches JSON: "apiKey": "..."
        const jsMatch = text.match(new RegExp(`["']?${key}["']?\\s*:\\s*["'\`]([^"'\`]+)["'\`]`, 'i'));
        if (jsMatch && jsMatch[1]) return jsMatch[1].trim();

        // Matches ENV format: VITE_FIREBASE_API_KEY=... or API_KEY=...
        const envMatch = text.match(new RegExp(`(?:VITE_FIREBASE_|FIREBASE_)?${key}\\s*=\\s*["']?([^\\r\\n"']+)["']?`, 'i'));
        if (envMatch && envMatch[1]) return envMatch[1].trim();
      }
      return '';
    };

    const apiKey = extract(['apiKey', 'api_key']);
    const projectId = extract(['projectId', 'project_id']);
    const authDomain = extract(['authDomain', 'auth_domain']);
    const storageBucket = extract(['storageBucket', 'storage_bucket']);
    const messagingSenderId = extract(['messagingSenderId', 'messaging_sender_id', 'senderId']);
    const appId = extract(['appId', 'app_id']);

    if (apiKey || projectId) {
      setFormConfig((prev) => ({
        ...prev,
        apiKey: apiKey || prev.apiKey,
        authDomain: authDomain || prev.authDomain,
        projectId: projectId || prev.projectId,
        storageBucket: storageBucket || prev.storageBucket,
        messagingSenderId: messagingSenderId || prev.messagingSenderId,
        appId: appId || prev.appId,
      }));
      setParseSuccess(true);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formConfig.apiKey.trim() || !formConfig.projectId.trim()) {
      alert('API Key and Project ID are required to connect Firebase.');
      return;
    }
    saveCustomFirebaseConfig({
      ...formConfig,
      apiKey: formConfig.apiKey.trim(),
      projectId: formConfig.projectId.trim(),
      authDomain: formConfig.authDomain.trim(),
      storageBucket: formConfig.storageBucket?.trim() || '',
      messagingSenderId: formConfig.messagingSenderId.trim(),
      appId: formConfig.appId.trim(),
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-2xl w-full flex flex-col gap-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-600/30">
            <Database className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">ChatPulse CRM</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Connect your Firebase backend to start managing leads, properties, and sales pipelines with real persistence.
          </p>
        </div>

        {/* Action Card */}
        <Card className="border-indigo-100 shadow-md">
          <div className="flex items-start gap-3.5 pb-4 border-b border-slate-100">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Firebase Configuration Required</h2>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Paste your Firebase credentials below to connect immediately (no code editing or .env search required).
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-5">
            {/* Steps Checklist */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                How to find your credentials in Firebase (3 clicks):
              </h3>
              <ol className="text-xs text-slate-600 space-y-1.5 list-decimal pl-4">
                <li>
                  Go to{' '}
                  <a
                    href="https://console.firebase.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 font-semibold hover:underline inline-flex items-center gap-0.5"
                  >
                    Firebase Console <ExternalLink className="w-3 h-3 inline" />
                  </a>{' '}
                  and open your project.
                </li>
                <li>
                  Click the <strong>Project Settings (gear icon ⚙️)</strong> at top-left.
                </li>
                <li>
                  Scroll down to <strong>Your apps</strong>. If you don't have a web app yet, click the <strong>&lt;/&gt; (Web)</strong> icon.
                </li>
                <li>
                  Copy the <code>const firebaseConfig = &#123; ... &#125;;</code> snippet and paste it in the box below!
                </li>
              </ol>
            </div>

            {/* Always visible form */}
            <form onSubmit={handleSaveConfig} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">
                    Paste Firebase Config Snippet (Auto-Fills Below):
                  </label>
                  {parseSuccess && (
                    <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Fields auto-detected!
                    </span>
                  )}
                </div>
                <textarea
                  rows={3}
                  placeholder={`Paste your firebaseConfig object here:\nconst firebaseConfig = {\n  apiKey: "...",\n  projectId: "..."\n};`}
                  value={rawSnippet}
                  onChange={(e) => handleSnippetPaste(e.target.value)}
                  className="w-full text-xs font-mono p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                />
              </div>

              <div className="text-xs font-semibold text-slate-700 pt-1">
                Or fill credentials individually:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="API Key"
                  placeholder="AIzaSy..."
                  required
                  value={formConfig.apiKey}
                  onChange={(e) => setFormConfig({ ...formConfig, apiKey: e.target.value })}
                />
                <Input
                  label="Project ID"
                  placeholder="my-firebase-project"
                  required
                  value={formConfig.projectId}
                  onChange={(e) => setFormConfig({ ...formConfig, projectId: e.target.value })}
                />
                <Input
                  label="Auth Domain"
                  placeholder="my-firebase-project.firebaseapp.com"
                  value={formConfig.authDomain}
                  onChange={(e) => setFormConfig({ ...formConfig, authDomain: e.target.value })}
                />
                <Input
                  label="App ID"
                  placeholder="1:123456789012:web:abcdef..."
                  value={formConfig.appId}
                  onChange={(e) => setFormConfig({ ...formConfig, appId: e.target.value })}
                />
                <Input
                  label="Messaging Sender ID"
                  placeholder="123456789012"
                  value={formConfig.messagingSenderId}
                  onChange={(e) => setFormConfig({ ...formConfig, messagingSenderId: e.target.value })}
                />
                <Input
                  label="Storage Bucket (Optional - Leave blank for Spark)"
                  placeholder="project.firebasestorage.app (optional)"
                  value={formConfig.storageBucket}
                  onChange={(e) => setFormConfig({ ...formConfig, storageBucket: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyEnvToClipboard}
                  icon={copiedEnv ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  {copiedEnv ? 'Copied .env template!' : 'Copy .env format'}
                </Button>

                <Button type="submit" size="md" icon={<RefreshCw className="w-4 h-4" />}>
                  Save &amp; Connect to Firebase
                </Button>
              </div>
            </form>
          </div>
        </Card>

        {/* Security Notice */}
        <p className="text-center text-[11px] text-slate-400">
          ChatPulse CRM connects securely to your Firebase instance using Client SDK credentials. No Admin private keys are required or stored.
        </p>
      </div>
    </div>
  );
};
