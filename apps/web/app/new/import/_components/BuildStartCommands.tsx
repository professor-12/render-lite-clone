import { FiTerminal } from 'react-icons/fi';
import { HintText } from './HintText';
import { SectionLabel } from './SectionLabel';

type BuildStartCommandsProps = {
  buildCommand: string;
  startCommand: string;
  onBuildCommandChange: (value: string) => void;
  onStartCommandChange: (value: string) => void;
};

export function BuildStartCommands({
  buildCommand,
  startCommand,
  onBuildCommandChange,
  onStartCommandChange,
}: BuildStartCommandsProps) {
  return (
    <div className="rounded-xl border border-white/8 bg-[#111111] divide-y divide-white/6 overflow-hidden">
      <div className="px-4 py-4">
        <SectionLabel>Build Command</SectionLabel>
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-white/8 bg-[#0a0a0a] focus-within:ring-2 focus-within:ring-white/10 focus-within:border-white/20 transition-all">
          <FiTerminal className="text-[15px] text-[#555] shrink-0" />
          <input
            type="text"
            value={buildCommand}
            onChange={(e) => onBuildCommandChange(e.target.value)}
            placeholder="npm run build"
            className="flex-1 text-[13px] font-mono bg-transparent text-[#f0f0f0] placeholder:text-[#444] focus:outline-none"
          />
        </div>
        <HintText>The command that builds your application for production.</HintText>
      </div>
      <div className="px-4 py-4">
        <SectionLabel>Start Command</SectionLabel>
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-white/8 bg-[#0a0a0a] focus-within:ring-2 focus-within:ring-white/10 focus-within:border-white/20 transition-all">
          <FiTerminal className="text-[15px] text-[#555] shrink-0" />
          <input
            type="text"
            value={startCommand}
            onChange={(e) => onStartCommandChange(e.target.value)}
            placeholder="npm start"
            className="flex-1 text-[13px] font-mono bg-transparent text-[#f0f0f0] placeholder:text-[#444] focus:outline-none"
          />
        </div>
        <HintText>The command that starts your application.</HintText>
      </div>
    </div>
  );
}
