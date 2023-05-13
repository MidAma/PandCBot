const { MessageEmbed, Permissions } = require("discord.js");
const axios = require('axios');
const header = require("../../util/headers.js");
const logs = require("../../util/logs.js");

module.exports = async (client, db, oldGuild, newGuild) => {
    const guild = oldGuild;
    const dbname = "update";
    const name = "Modification du serveur";
    const raison = `Antiraid | ${name}`;
    const head = header(client.token);
    const base = `https://discord.com/api/v9/guilds/${guild.id}`;
    const r = await axios.get(`${base}/audit-logs?ilimit=1&action_type=1`, { headers: head })
    if (!r) return;
    const executor = guild.members.cache.get(r.data.audit_log_entries[0].user_id);
    if (executor) {
        let perm = "";
        let punish = "";
        let user_punish = false;
        if (db.get(`${dbname}wl_${guild.id}`) === null) perm = client.user.id === executor.id || guild.ownerId === executor.id || client.config.owner.includes(executor.id) || db.get(`owner_${client.user.id}_${executor.id}`) === true || db.get(`wl_${guild.id}_${executor.id}`) === true;
        if (db.get(`${dbname}wl_${guild.id}`) === true) perm = client.user.id === executor.id || guild.ownerId === executor.id || client.config.owner.includes(executor.id) || db.get(`owner_${client.user.id}_${executor.id}`) === true;
        if (db.get(`${dbname}_${guild.id}`) === true && !perm) {
            if (!db.get(`${dbname}sanction_${guild.id}`) || db.get(`${dbname}sanction_${guild.id}`) === "kick") punish = "kick";
            if (db.get(`${dbname}sanction_${guild.id}`) === "ban") punish = "ban";
            if (db.get(`${dbname}sanction_${guild.id}`) === "derank") punish = "derank";
            const obj2 = {
                client: client,
                guild: guild,
                db: db,
                executor: executor.id,
                punish: `🟢 ${punish}`,
                name: name,
            };
            const obj3 = {
                client: client,
                guild: guild,
                db: db,
                executor: executor.id,
                punish: `🔴 ${punish}`,
                name: name,
            };
            newGuild.setName(oldGuild.name);
            newGuild.setIcon(oldGuild.iconURL({ dynamic: true }));
            newGuild.setBanner(oldGuild.bannerURL());
            newGuild.setChannelPositions([{ channel: oldGuild.id, position: oldGuild.position }]);
            newGuild.setSystemChannel(oldGuild.systemChannel);
            newGuild.setSystemChannelFlags(oldGuild.systemChannelFlags);
            newGuild.setVerificationLevel(oldGuild.verificationLevel);
            newGuild.setRulesChannel(oldGuild.rulesChannel);
            newGuild.setPublicUpdatesChannel(oldGuild.publicUpdatesChannel);
            newGuild.setDefaultMessageNotifications(oldGuild.defaultMessageNotifications);
            newGuild.setAFKChannel(oldGuild.afkChannel);
            newGuild.setAFKTimeout(oldGuild.afkTimeout);
            axios({
                url: `${base}/vanity-url`,
                method: 'PATCH',
                headers: head,
                data: {
                    code: oldGuild.vanityURLCode
                },
            }).catch(() => { });
            if (punish === "ban") {
                const rsl = await executor.ban(raison).catch(() => { });
                if (rsl) user_punish = true;
            } else if (punish === "kick") {
                const rsl = await executor.kick(raison).catch(() => { });
                if (rsl) user_punish = true;
            } else if (punish === "derank") {
                const rsl = await executor.roles.set([], raison).catch(() => { });
                if (rsl) user_punish = true;
            }
            if (user_punish) return logs(obj2);
            else return logs(obj3);
        }
    }


}