"use server";

import parse from "node-html-parser";

export interface Programm {
  programmName: string;
  programmTime: string;
}

export interface Channel {
  channel: string;
  programms: Programm[];
}

export async function getProgramms(): Promise<Channel[]> {
  const response = await fetch("http://www.programmatileorasis.gr", {
    next: {
      revalidate: 10, // 10 seconds
    },
  });
  const html = await response.text();
  const root = parse(html);
  const channels = root.querySelectorAll("div.program_list");
  const pipi = channels.map((channel) => {
    const prName = channel.querySelectorAll("tbody tr td:nth-child(2)");
    const prHour = channel.querySelectorAll("tbody tr td:first-child");
    const chNameElement = channel.querySelector("thead tr td b");
    const chName = chNameElement?.innerText || "Unknown Channel";
    prHour.shift();
    const chNameTxt = prName.map((d) => d.innerText.split("🔍")[0]);
    const chHourTxt = prHour.map((d) => d.innerText);
    const rt = chNameTxt.map((name, index) => {
      return {
        programmName: name,
        programmTime: chHourTxt[index] || "",
      };
    });

    return { channel: chName, programms: rt };
  });
  // Remove last two channels (Nickelodeon and others)
  pipi.pop();
  pipi.pop();
  return pipi;
}
