import Link from "next/link";
import styles from "./Logo.module.css";

type LogoProps = {
  href?: string;
  compact?: boolean;
};

/**
 * Aquilar mark — stylized “A” with integrated eagle wing/swoosh.
 * Faithful to Design_Images/Aquilar_Group_Logo.jpg geometry.
 */
function Mark() {
  return (
    <svg
      className={styles.mark}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/*
        Single cohesive mark:
        - Peak A structure
        - Horizontal eagle wing/swoosh with head silhouette on the right
        - Clean inner counter (negative triangle)
      */}
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="
          M50 6
          L10 92
          H28
          L35.5 72
          H64.5
          L72 92
          H90
          L50 6
          Z

          M50 28
          L61 58
          H39
          L50 28
          Z

          M18 58
          C32 48 48 46 66 54
          C72 57 78 60 84 62
          C86 58 85 54 81 51
          C74 45 64 42 52 42
          C40 42 28 46 18 58
          Z

          M78 56
          C82 57 86 60 89 65
          C88 59 85 55 80 53
          C78.5 52.5 77.5 54 78 56
          Z
        "
      />
    </svg>
  );
}

export default function Logo({ href = "/", compact = false }: LogoProps) {
  const mark = (
    <span className={`${styles.logo} ${compact ? styles.compact : ""}`}>
      <Mark />
      <span className={styles.wordmark}>
        <span className={styles.name}>AQUILAR</span>
        <span className={styles.group}>GROUP</span>
      </span>
    </span>
  );

  if (!href) return mark;

  return (
    <Link href={href} className={styles.link} aria-label="Aquilar Group — Home">
      {mark}
    </Link>
  );
}
