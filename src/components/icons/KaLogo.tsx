export default function KaLogo({ className }: { className: string }) {
  return (
    <div className={`h-auto ${className}`}>
      <svg viewBox="0 0 351.3 285.8" xmlns="http://www.w3.org/2000/svg">
        <title>Ka logo</title>
        <defs>
          <clipPath clipPathUnits="userSpaceOnUse" id="a">
            <path d="M-971 795h2000v-2000H-971Z" />
          </clipPath>
          <clipPath clipPathUnits="userSpaceOnUse" id="b">
            <path d="M-1000 857h2000v-2000h-2000Z" />
          </clipPath>
        </defs>
        <g fill="currentColor">
          <path
            d="M0 0c15 22 24 29 33 36v2L8 37l-1-1c5-7 5-13-10-36l-74-114V-3c0 24 3 30 10 38v1h-36v-1c7-8 10-14 10-38v-134c0-25-3-31-10-38v-2h36v2c-7 7-10 13-10 38v19l28 43 32-47 3 19-27 40z"
            transform="matrix(1.33 0 0 -1.33 137 50)"
            clipPath="url(#a)"
          />
          <path
            d="m0 0-12-1v2l42 64 11 18 10-25L69 2l2-6 14-42C67-18 35 0 0 0m110-75L54 98H28v-1c10-8 4-24-1-32C1 23-37-22-37-64c0-21 9-38 24-51h35v1c-28 12-51 29-51 64 0 14 6 29 14 45l1 1v1A100 100 0 0 0 88-54l7-21c8-25 6-31-2-39v-1h39v1c-8 8-14 14-22 39"
            transform="matrix(1.33 0 0 -1.33 176 133)"
            clipPath="url(#b)"
          />
        </g>
      </svg>
    </div>
  )
}
