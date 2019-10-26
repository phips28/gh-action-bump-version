FROM node:10-slim

LABEL version="1.0.0"
LABEL repository="http://github.com/phips28/gh-action-bump-version"
LABEL homepage="http://github.com/gh-action-bump-version"
LABEL maintainer="Philipp Holly <phips28@gmx.at>"

LABEL com.github.actions.name="Automated version bump for npm packages."
LABEL com.github.actions.description="Automated version bump for npm packages."
LABEL com.github.actions.icon="package"
LABEL com.github.actions.color="red"
COPY LICENSE README.md /

RUN apt-get update
RUN apt-get -y install git

COPY "entrypoint.sh" "/entrypoint.sh"
ENTRYPOINT ["/entrypoint.sh"]
CMD ["help"]

