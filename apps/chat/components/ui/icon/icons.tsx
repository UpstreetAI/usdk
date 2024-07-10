import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpCircle,
  ArrowUpRight,
  AtSign,
  BookDashed,
  Briefcase,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Circle,
  CircleDot,
  Code,
  Command,
  CornerUpLeft,
  CornerUpRight,
  Cpu,
  CreditCard,
  EyeOff,
  File,
  FileClock,
  FileQuestion,
  FileScan,
  FileText,
  Flag,
  GitBranch,
  GitBranchPlus,
  GitFork,
  Github,
  HelpCircle,
  Home,
  Image,
  Inbox,
  Info,
  Laptop,
  Layers,
  Link,
  List,
  Loader,
  Loader2,
  Lock,
  LucideProps,
  Menu,
  MessageCircle,
  MessageSquare,
  Moon,
  MoreHorizontal,
  MoreVertical,
  Network,
  Pin,
  Pizza,
  Plus,
  RefreshCcw,
  ScanLine,
  Search,
  Send,
  Settings,
  ShieldAlert,
  SlidersHorizontal,
  SunMedium,
  Table,
  Timer,
  Trash,
  Twitter,
  Undo,
  Undo2,
  User,
  UserX,
  Users,
  UsersRound,
  Wand,
  Wand2,
  X,
  XCircle,
  Zap,
} from "lucide-react"

// import { LogoIcon } from "../../composed/logo"

export const Icons: Record<string, any> = {
  userX: UserX,
  bookDashed: BookDashed,
  npm: ({ ...props }: LucideProps) => (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width="540px"
      height="210px"
      viewBox="0 0 18 7"
      {...props}
    >
      <path
        fill="#CB3837"
        d="M0,0h18v6H9v1H5V6H0V0z M1,5h2V2h1v3h1V1H1V5z M6,1v5h2V5h2V1H6z M8,2h1v2H8V2z M11,1v4h2V2h1v3h1V2h1v3h1V1H11z"
      />
      <polygon fill="#FFFFFF" points="1,5 3,5 3,2 4,2 4,5 5,5 5,1 1,1 " />
      <path fill="#FFFFFF" d="M6,1v5h2V5h2V1H6z M9,4H8V2h1V4z" />
      <polygon
        fill="#FFFFFF"
        points="11,1 11,5 13,5 13,2 14,2 14,5 15,5 15,2 16,2 16,5 17,5 17,1 "
      />
    </svg>
  ),
  cpu: Cpu,
  lock: Lock,
  code: Code,
  flag: Flag,
  briefcase: Briefcase,
  undo: Undo,
  arrowUpCircle: ArrowUpCircle,
  atSign: AtSign,
  messageCircle: MessageCircle,
  cornerUpRight: CornerUpRight,
  cornerUpLeft: CornerUpLeft,
  zap: Zap,
  send: Send,
  fileScan: FileScan,
  circle: Circle,
  gitFork: GitFork,
  bookPlus: GitBranchPlus,
  undo2: Undo2,
  review: FileClock,
  scanLine: ScanLine,
  eyeOff: EyeOff,
  arrowUp: ArrowUp,
  arrowLeft: ArrowLeft,
  arrowDown: ArrowDown,
  crossCircle: XCircle,
  info: Info,
  inbox: Inbox,
  loader: Loader,
  checkCircle: CheckCircle2,
  question: FileQuestion,
  mixerHorizontal: SlidersHorizontal,
  more: MoreHorizontal,
  link: Link,
  dot: CircleDot,
  timer: Timer,
  branch: GitBranch,
  shieldAlert: ShieldAlert,
  message: MessageSquare,
  network: Network,
  github: Github,
  list: List,
  table: Table,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  search: Search,
  activity: Activity,
  alertCircle: AlertCircle,
  layers: Layers,
  home: Home,
  // logo: LogoIcon,
  close: X,
  spinner: Loader2,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  trash: Trash,
  post: FileText,
  page: File,
  media: Image,
  settings: Settings,
  billing: CreditCard,
  ellipsis: MoreVertical,
  add: Plus,
  warning: AlertTriangle,
  user: User,
  arrowRight: ArrowRight,
  arrowUpRight: ArrowUpRight,
  help: HelpCircle,
  users: UsersRound,
  pizza: Pizza,
  pin: Pin,
  sun: SunMedium,
  moon: Moon,
  laptop: Laptop,
  gitHub: ({ ...props }: LucideProps) => (
    <svg
      aria-hidden="true"
      focusable="false"
      data-prefix="fab"
      data-icon="github"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 496 512"
      {...props}
    >
      <path
        fill="currentColor"
        d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3 .3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5 .3-6.2 2.3zm44.2-1.7c-2.9 .7-4.9 2.6-4.6 4.9 .3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3 .7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3 .3 2.9 2.3 3.9 1.6 1 3.6 .7 4.3-.7 .7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3 .7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3 .7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"
      ></path>
    </svg>
  ),
  google: ({ ...props }: LucideProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width="100%"
      height="100%"
      {...props}
    >
      <path
        fill="#FFC107"
        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
      />
      <path
        fill="#FF3D00"
        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
      />
      <path
        fill="#1976D2"
        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
      />
    </svg>
  ),
  microsoft: ({ ...props }: LucideProps) => (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width="22" height="22" fill={`url(#microsoft)`} />
      <defs>
        <pattern
          id={"microsoft"}
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use href="#microsoftImage" transform="scale(0.000976562)" />
        </pattern>
        <image
          id="microsoftImage"
          width="1024"
          height="1024"
          xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAkrSURBVHgB7dkxapZpFIbh80twlBACg45FIN206WymmCXMNpxtCC7AzjXYC+4hhZ1iY5FGsBL5UIygERfxfoX3de3hcG54Dtu23QwAkHJrAIAcAQAAQQIAAIIEAAAECQAACBIAABAkAAAgSAAAQJAAAIAgAQAAQQIAAIIEAAAECQAACBIAABAkAAAgSAAAQJAAAIAgAQAAQQIAAIIEAAAECQAACDqaVZ4/nbl6O8COTu/NPHoyK7x89/98/vZhgP38dXwx/54/nhXWBcCv5//mcoAd3T+bVd5vl/Pp+mqA34MJAACCBAAABAkAAAgSAAAQJAAAIEgAAECQAACAIAEAAEECAACCBAAABAkAAAgSAAAQJAAAIEgAAECQAACAIAEAAEECAACCBAAABAkAAAgSAAAQJAAAIEgAAECQAACAIAEAAEECAACCBAAABAkAAAgSAAAQJAAAIEgAAECQAACAIAEAAEECAACCBAAABAkAAAgSAAAQJAAAIEgAAECQAACAIAEAAEECAACCBAAABAkAAAgSAAAQJAAAIEgAAECQAACAIAEAAEECAACCBAAABAkAAAgSAAAQJAAAIEgAAECQAACAIAEAAEECAACCBAAABAkAAAgSAAAQJAAAIEgAAECQAACAIAEAAEECAACCBAAABAkAAAgSAAAQJAAAIEgAAECQAACAIAEAAEECAACCBAAABAkAAAgSAAAQJAAAIEgAAECQAACAIAEAAEECAACCBAAABAkAAAgSAAAQJAAAIEgAAECQAACAIAEAAEECAACCBAAABAkAAAgSAAAQJAAAIEgAAECQAACAIAEAAEECAACCBAAABAkAAAgSAAAQJAAAIEgAAECQAACAIAEAAEECAACCBAAABAkAAAgSAAAQJAAAIEgAAECQAACAIAEAAEECAACCBAAABAkAAAgSAAAQJAAAIEgAAECQAACAIAEAAEECAACCBAAABAkAAAgSAAAQJAAAIEgAAECQAACAIAEAAEECAACCBAAABAkAAAgSAAAQJAAAIEgAAECQAACAIAEAAEECAACCBAAABAkAAAgSAAAQJAAAIEgAAECQAACAIAEAAEECAACCBAAABAkAAAgSAAAQJAAAIEgAAECQAACAIAEAAEECAACCBAAABAkAAAgSAAAQJAAAIEgAAECQAACAIAEAAEECAACCBAAABAkAAAgSAAAQJAAAIEgAAECQAACAIAEAAEECAACCBAAABAkAAAgSAAAQJAAAIEgAAECQAACAIAEAAEECAACCBAAABAkAAAgSAAAQJAAAIEgAAECQAACAIAEAAEECAACCBAAABAkAAAgSAAAQJAAAIEgAAECQAACAIAEAAEECAACCBAAABAkAAAgSAAAQJAAAIEgAAECQAACAIAEAAEECAACCBAAABAkAAAgSAAAQJAAAIEgAAECQAACAIAEAAEECAACCBAAABAkAAAgSAAAQJAAAIEgAAECQAACAIAEAAEECAACCBAAABAkAAAgSAAAQdDSrnN6buX82wI7+fDCrnNx2z7C349vrbvqwbdvNAAApJgAACBIAABAkAAAgSAAAQJAAAIAgAQAAQQIAAIIEAAAECQAACBIAABAkAAAgSAAAQJAAAIAgAQAAQQIAAIIEAAAECQAACBIAABAkAAAgSAAAQJAAAICgo1nk0asfc/lxgB2d3Z158c+arr/7+r+5df1+gP18P3k4X/9+NissC4AP1zNXX24G2NNhVvn1/A/XVwPs53DnfFYxAQBAkAAAgCABAABBAgAAggQAAAQJAAAIEgAAECQAACBIAABAkAAAgCABAABBAgAAggQAAAQJAAAIEgAAECQAACBIAABAkAAAgCABAABBAgAAggQAAAQJAAAIEgAAECQAACBIAABAkAAAgCABAABBAgAAggQAAAQJAAAIEgAAECQAACBIAABAkAAAgCABAABBAgAAggQAAAQJAAAIEgAAECQAACBIAABAkAAAgCABAABBAgAAggQAAAQJAAAIEgAAECQAACBIAABAkAAAgCABAABBAgAAggQAAAQJAAAIEgAAECQAACBIAABAkAAAgCABAABBAgAAggQAAAQJAAAIEgAAECQAACBIAABAkAAAgCABAABBAgAAggQAAAQJAAAIEgAAECQAACBIAABAkAAAgCABAABBAgAAggQAAAQJAAAIEgAAECQAACBIAABAkAAAgCABAABBAgAAggQAAAQJAAAIEgAAECQAACBIAABAkAAAgCABAABBAgAAggQAAAQJAAAIEgAAECQAACBIAABAkAAAgCABAABBAgAAggQAAAQJAAAIEgAAECQAACBIAABAkAAAgCABAABBAgAAggQAAAQJAAAIEgAAECQAACBIAABAkAAAgCABAABBAgAAggQAAAQJAAAIEgAAECQAACBIAABAkAAAgCABAABBAgAAggQAAAQJAAAIEgAAECQAACBIAABAkAAAgCABAABBAgAAggQAAAQJAAAIEgAAECQAACBIAABAkAAAgCABAABBAgAAggQAAAQJAAAIEgAAECQAACBIAABAkAAAgCABAABBAgAAggQAAAQJAAAIEgAAECQAACBIAABAkAAAgCABAABBAgAAggQAAAQJAAAIEgAAECQAACBIAABAkAAAgCABAABBAgAAggQAAAQJAAAIEgAAECQAACBIAABAkAAAgCABAABBAgAAggQAAAQJAAAIEgAAECQAACBIAABAkAAAgCABAABBAgAAggQAAAQJAAAIEgAAECQAACBIAABAkAAAgCABAABBAgAAggQAAAQJAAAIEgAAECQAACBIAABAkAAAgCABAABBAgAAggQAAAQJAAAIEgAAECQAACBIAABAkAAAgCABAABBAgAAggQAAAQJAAAIEgAAECQAACBIAABAkAAAgCABAABBAgAAggQAAAQJAAAIEgAAECQAACBIAABAkAAAgCABAABBAgAAgo5mkYvTwwD7evDHLPP95OEc7pwPsJ8fxxezymHbtpsBAFJMAAAQJAAAIEgAAECQAACAIAEAAEECAACCBAAABAkAAAgSAAAQJAAAIEgAAECQAACAIAEAAEECAACCBAAABAkAAAgSAAAQJAAAIEgAAECQAACAIAEAAEE/AYjiOfCfYpmvAAAAAElFTkSuQmCC"
        />
      </defs>
    </svg>
  ),
  twitter: Twitter,
  check: Check,
  hamburgerMenu: Menu,
  dotSpinner: ({ ...props }: LucideProps) => (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="3" r="0">
        <animate
          id="spinner_318l"
          begin="0;spinner_cvkU.end-0.5s"
          attributeName="r"
          calcMode="spline"
          dur="0.6s"
          values="0;2;0"
          keyTimes="0;.2;1"
          keySplines="0,1,0,1;.53,0,.61,.73"
          fill="freeze"
        />
      </circle>
      <circle cx="16.50" cy="4.21" r="0">
        <animate
          id="spinner_g5Gj"
          begin="spinner_318l.begin+0.1s"
          attributeName="r"
          calcMode="spline"
          dur="0.6s"
          values="0;2;0"
          keyTimes="0;.2;1"
          keySplines="0,1,0,1;.53,0,.61,.73"
          fill="freeze"
        />
      </circle>
      <circle cx="7.50" cy="4.21" r="0">
        <animate
          id="spinner_cvkU"
          begin="spinner_Uuk0.begin+0.1s"
          attributeName="r"
          calcMode="spline"
          dur="0.6s"
          values="0;2;0"
          keyTimes="0;.2;1"
          keySplines="0,1,0,1;.53,0,.61,.73"
          fill="freeze"
        />
      </circle>
      <circle cx="19.79" cy="7.50" r="0">
        <animate
          id="spinner_e8rM"
          begin="spinner_g5Gj.begin+0.1s"
          attributeName="r"
          calcMode="spline"
          dur="0.6s"
          values="0;2;0"
          keyTimes="0;.2;1"
          keySplines="0,1,0,1;.53,0,.61,.73"
          fill="freeze"
        />
      </circle>
      <circle cx="4.21" cy="7.50" r="0">
        <animate
          id="spinner_Uuk0"
          begin="spinner_z7ol.begin+0.1s"
          attributeName="r"
          calcMode="spline"
          dur="0.6s"
          values="0;2;0"
          keyTimes="0;.2;1"
          keySplines="0,1,0,1;.53,0,.61,.73"
          fill="freeze"
        />
      </circle>
      <circle cx="21.00" cy="12.00" r="0">
        <animate
          id="spinner_MooL"
          begin="spinner_e8rM.begin+0.1s"
          attributeName="r"
          calcMode="spline"
          dur="0.6s"
          values="0;2;0"
          keyTimes="0;.2;1"
          keySplines="0,1,0,1;.53,0,.61,.73"
          fill="freeze"
        />
      </circle>
      <circle cx="3.00" cy="12.00" r="0">
        <animate
          id="spinner_z7ol"
          begin="spinner_KEoo.begin+0.1s"
          attributeName="r"
          calcMode="spline"
          dur="0.6s"
          values="0;2;0"
          keyTimes="0;.2;1"
          keySplines="0,1,0,1;.53,0,.61,.73"
          fill="freeze"
        />
      </circle>
      <circle cx="19.79" cy="16.50" r="0">
        <animate
          id="spinner_btyV"
          begin="spinner_MooL.begin+0.1s"
          attributeName="r"
          calcMode="spline"
          dur="0.6s"
          values="0;2;0"
          keyTimes="0;.2;1"
          keySplines="0,1,0,1;.53,0,.61,.73"
          fill="freeze"
        />
      </circle>
      <circle cx="4.21" cy="16.50" r="0">
        <animate
          id="spinner_KEoo"
          begin="spinner_1IYD.begin+0.1s"
          attributeName="r"
          calcMode="spline"
          dur="0.6s"
          values="0;2;0"
          keyTimes="0;.2;1"
          keySplines="0,1,0,1;.53,0,.61,.73"
          fill="freeze"
        />
      </circle>
      <circle cx="16.50" cy="19.79" r="0">
        <animate
          id="spinner_1sIS"
          begin="spinner_btyV.begin+0.1s"
          attributeName="r"
          calcMode="spline"
          dur="0.6s"
          values="0;2;0"
          keyTimes="0;.2;1"
          keySplines="0,1,0,1;.53,0,.61,.73"
          fill="freeze"
        />
      </circle>
      <circle cx="7.50" cy="19.79" r="0">
        <animate
          id="spinner_1IYD"
          begin="spinner_NWhh.begin+0.1s"
          attributeName="r"
          calcMode="spline"
          dur="0.6s"
          values="0;2;0"
          keyTimes="0;.2;1"
          keySplines="0,1,0,1;.53,0,.61,.73"
          fill="freeze"
        />
      </circle>
      <circle cx="12" cy="21" r="0">
        <animate
          id="spinner_NWhh"
          begin="spinner_1sIS.begin+0.1s"
          attributeName="r"
          calcMode="spline"
          dur="0.6s"
          values="0;2;0"
          keyTimes="0;.2;1"
          keySplines="0,1,0,1;.53,0,.61,.73"
          fill="freeze"
        />
      </circle>
    </svg>
  ),
  wand2: Wand2,
  refresh: RefreshCcw,
}
