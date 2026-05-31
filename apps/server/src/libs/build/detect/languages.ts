import type { BuildResult } from './types';
import type { FileSet } from './file-set';

export type LanguageDetector = {
  /** Root files (any match) that activate this detector. */
  triggers: string[];
  /** Build a result, given the file set for finer-grained framework detection. */
  build: (files: FileSet) => BuildResult;
};

/**
 * Non-Node language detectors, evaluated in order after Docker and Node. Each
 * detector owns its install / build / start commands so the output is accurate
 * per ecosystem instead of a one-size-fits-all guess.
 */
export const LANGUAGE_DETECTORS: ReadonlyArray<LanguageDetector> = [
  {
    triggers: ['requirements.txt', 'pyproject.toml', 'pipfile', 'manage.py'],
    build: (files) => {
      const reason: string[] = ['Python project detected'];

      let install: string;
      if (files.has('poetry.lock')) {
        install = 'poetry install';
        reason.push('Poetry lockfile detected');
      } else if (files.has('Pipfile')) {
        install = 'pipenv install';
        reason.push('Pipenv detected');
      } else if (files.has('requirements.txt')) {
        install = 'pip install -r requirements.txt';
      } else {
        install = 'pip install .';
      }

      // Django ships a manage.py entrypoint.
      if (files.has('manage.py')) {
        reason.push('Django detected (manage.py)');
        return {
          installCommand: install,
          buildCommand: 'python manage.py collectstatic --noinput',
          startCommand: 'python manage.py runserver 0.0.0.0:8000',
          runtime: 'python',
          framework: 'django',
          projectType: 'dynamic',
          reason,
        };
      }

      return {
        installCommand: install,
        buildCommand: '',
        startCommand: 'python app.py',
        runtime: 'python',
        projectType: 'dynamic',
        reason,
      };
    },
  },
  {
    triggers: ['go.mod'],
    build: () => ({
      installCommand: 'go mod download',
      buildCommand: 'go build -o app ./...',
      startCommand: './app',
      runtime: 'go',
      projectType: 'dynamic',
      reason: ['Go module detected'],
    }),
  },
  {
    triggers: ['Gemfile'],
    build: (files) => {
      const isRails = files.hasAny('config.ru') || files.has('Rakefile');
      return {
        installCommand: 'bundle install',
        buildCommand: '',
        startCommand: isRails ? 'bundle exec rails server -b 0.0.0.0' : 'bundle exec ruby app.rb',
        runtime: 'ruby',
        framework: isRails ? 'rails' : undefined,
        projectType: 'dynamic',
        reason: [isRails ? 'Ruby on Rails detected' : 'Ruby project detected'],
      };
    },
  },
  {
    triggers: ['composer.json'],
    build: (files) => {
      const isLaravel = files.has('artisan');
      return {
        installCommand: 'composer install --no-dev --optimize-autoloader',
        buildCommand: '',
        startCommand: isLaravel
          ? 'php artisan serve --host 0.0.0.0 --port 8000'
          : 'php -S 0.0.0.0:8000 -t public',
        runtime: 'php',
        framework: isLaravel ? 'laravel' : undefined,
        projectType: 'dynamic',
        reason: [isLaravel ? 'Laravel detected (artisan)' : 'PHP/Composer project detected'],
      };
    },
  },
  {
    triggers: ['Cargo.toml'],
    build: () => ({
      // `cargo build` fetches dependencies, so no separate install step.
      installCommand: '',
      buildCommand: 'cargo build --release',
      startCommand: './target/release/app',
      runtime: 'rust',
      projectType: 'dynamic',
      reason: ['Rust/Cargo project detected'],
    }),
  },
  {
    triggers: ['mix.exs'],
    build: () => ({
      installCommand: 'mix deps.get',
      buildCommand: 'mix compile',
      startCommand: 'mix run --no-halt',
      runtime: 'elixir',
      projectType: 'dynamic',
      reason: ['Elixir/Mix project detected'],
    }),
  },
  {
    triggers: ['build.gradle', 'build.gradle.kts', 'pom.xml'],
    build: (files) => {
      const isMaven = files.has('pom.xml');
      return {
        installCommand: isMaven ? 'mvn dependency:resolve' : './gradlew dependencies',
        buildCommand: isMaven ? 'mvn package -DskipTests' : './gradlew build',
        startCommand: isMaven ? 'java -jar target/app.jar' : './gradlew run',
        runtime: 'java',
        framework: isMaven ? 'maven' : 'gradle',
        projectType: 'dynamic',
        reason: [isMaven ? 'Maven project detected' : 'Gradle project detected'],
      };
    },
  },
  {
    triggers: ['Package.swift'],
    build: () => ({
      installCommand: 'swift package resolve',
      buildCommand: 'swift build -c release',
      startCommand: 'swift run',
      runtime: 'swift',
      projectType: 'dynamic',
      reason: ['Swift package detected'],
    }),
  },
  {
    triggers: ['pubspec.yaml'],
    build: (files) => {
      const isFlutter = files.hasAny('analysis_options.yaml') && files.has('pubspec.yaml');
      return {
        installCommand: isFlutter ? 'flutter pub get' : 'dart pub get',
        buildCommand: isFlutter ? 'flutter build web' : 'dart compile exe bin/main.dart',
        startCommand: isFlutter ? '' : 'dart run',
        outDir: isFlutter ? 'build/web' : undefined,
        runtime: 'dart',
        framework: isFlutter ? 'flutter' : undefined,
        projectType: isFlutter ? 'static' : 'dynamic',
        reason: [isFlutter ? 'Flutter project detected' : 'Dart project detected'],
      };
    },
  },
  {
    triggers: ['build.sbt'],
    build: () => ({
      installCommand: 'sbt update',
      buildCommand: 'sbt compile',
      startCommand: 'sbt run',
      runtime: 'scala',
      projectType: 'dynamic',
      reason: ['Scala/sbt project detected'],
    }),
  },
  {
    triggers: ['stack.yaml', 'cabal.project'],
    build: () => ({
      installCommand: 'stack setup',
      buildCommand: 'stack build',
      startCommand: 'stack run',
      runtime: 'haskell',
      projectType: 'dynamic',
      reason: ['Haskell/Stack project detected'],
    }),
  },
];
