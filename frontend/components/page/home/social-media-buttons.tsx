"use client"
import { cn } from "@/lib/utils"
import { theme } from "@/lib/theme"

export function SocialMediaButtons({ className }: { className?: string }) {
  return (
    <>
      <style jsx>{`
        .wrapper {
          display: inline-flex;
          list-style: none;
          padding: 0;
        }
        .wrapper .icon {
          position: relative;
          background: #333333;
          border-radius: 50%;
          margin: 10px;
          width: 40px;
          height: 40px;
          font-size: 18px;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          box-shadow: 0 10px 10px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        .wrapper .tooltip {
          position: absolute;
          top: 0;
          font-size: 14px;
          background: #ffffff;
          color: #ffffff;
          padding: 5px 8px;
          border-radius: 5px;
          box-shadow: 0 10px 10px rgba(0, 0, 0, 0.1);
          opacity: 0;
          pointer-events: none;
          transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        .wrapper .tooltip::before {
          position: absolute;
          content: "";
          height: 8px;
          width: 8px;
          background: #ffffff;
          bottom: -3px;
          left: 50%;
          transform: translate(-50%) rotate(45deg);
          transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        .wrapper .icon:hover .tooltip {
          top: -45px;
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
        }
        .wrapper .icon:hover span,
        .wrapper .icon:hover .tooltip {
          text-shadow: 0px -1px 0px rgba(0, 0, 0, 0.1);
        }
        .wrapper .facebook:hover,
        .wrapper .facebook:hover .tooltip,
        .wrapper .facebook:hover .tooltip::before {
          background: ${theme.colors.primary.main};
          color: #1D1D1D;
        }
        .wrapper .twitter:hover,
        .wrapper .twitter:hover .tooltip,
        .wrapper .twitter:hover .tooltip::before {
          background: ${theme.colors.primary.main};
          color: #1D1D1D;
        }
        .wrapper .instagram:hover,
        .wrapper .instagram:hover .tooltip,
        .wrapper .instagram:hover .tooltip::before {
          background: ${theme.colors.primary.main};
          color: #1D1D1D;
        }
        .wrapper .icon svg {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          width: 100%;
          padding: 8px;
        }
      `}</style>
      <ul className={cn("wrapper", className)}>
        <li className="icon facebook">
          <span className="tooltip">Facebook</span>
          <svg viewBox="0 0 320 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"></path>
          </svg>
        </li>
        <li className="icon twitter">
          <span className="tooltip">Twitter</span>
          <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"></path>
          </svg>
        </li>
        <li className="icon instagram">
          <span className="tooltip">Instagram</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"></path>
          </svg>
        </li>
      </ul>
    </>
  )
}
